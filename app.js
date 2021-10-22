'use strict';

const {
  SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET,
  SLACK_SIGNING_SECRET,
  SLACK_INSTALLATION_DYNAMODB_NAME,
  CSE_ID,
  API_KEY
} = process.env;

const { App, ExpressReceiver, AwsLambdaReceiver } = require('@slack/bolt');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({});
const awsServerlessExpress = require('aws-serverless-express');

const installFn = require('./src/install')(dynamo, SLACK_INSTALLATION_DYNAMODB_NAME);
const authorizeFn = require('./src/authorize')(installFn.fetchInstallation);
const slashCommand = require('./src/slashCommand')(CSE_ID, API_KEY);
const answerBot = require('./src/answerBot');

const eventReceiver = new AwsLambdaReceiver({
  signingSecret: SLACK_SIGNING_SECRET
});

const app = new App({
  receiver: eventReceiver,
  authorize: authorizeFn,
  processBeforeResponse: true
});

const refreshTokensFn = require('./src/refreshTokens')(
  SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET,
  installFn.fetchInstallation,
  installFn.storeInstallation,
  app.client.oauth.v2.access
);

app.command('/exampleCommand', async ({ command, ack, client, respond }) => {
  await ack();
  await slashCommand(command, client, respond);
});

app.action(/select_stamp_.*/, async ({ action, ack, respond }) => {
  await ack();
  await answerBot(action, respond);
});

module.exports.eventHandler = eventReceiver.toHandler();

const expressReceiver = new ExpressReceiver({
  clientId: SLACK_CLIENT_ID,
  clientSecret: SLACK_CLIENT_SECRET,
  scopes: ['commands', 'users:read', 'incoming-webhook', 'chat:write'],
  stateSecret: 'example-state-secret',
  installerOptions: {
    userScopes: ['chat:write']
  },
  installationStore: installFn
});

const server = awsServerlessExpress.createServer(expressReceiver.app);

module.exports.oauthHandler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};

module.exports.autoRefreshTokenHandler = async (event, context) => {
  console.log('autoRefreshTokenHandler is CALLED');
  const queries = [];
  const tablelInfo = {
    TableName: SLACK_INSTALLATION_DYNAMODB_NAME
  };
  const dbData = await dynamo
    .scan(tablelInfo, (err, data) => {
      if (err) {
        console.error('Unable to scan the database.');
      } else {
        console.log('Database is scanned!');
        return data;
      }
    })
    .promise();
  dbData.Items.forEach(el => {
    const info = JSON.parse(el.info.toString('utf-8'));
    const teamId = info.team?.id ? info.team?.id : undefined;
    const isEnterpriseInstall = info.isEnterpriseInstall === 'true' ? true : false;
    const enterpriseId = info.enterprise?.id ? info.enterprise?.id : undefined;
    const query = {
      teamId,
      isEnterpriseInstall,
      enterpriseId
    };
    queries.push(query);
  });
  const result = await Promise.all(
    queries.map(async query => {
      const freshResult = await refreshTokensFn(query).catch(err => {
        console.log(err);
      });
      return freshResult;
    })
  );
};
