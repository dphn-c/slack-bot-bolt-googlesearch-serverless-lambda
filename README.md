# Slack Bot with Bolt + Google Api + Serverless Framework + Lambda

## Goal

1. Use Google Api to search the image and return it when user call with example command.

2. Implement token rotation

3. Deploy to Lambda

## Prerequisite

- node.js
- npm
- AWS (AWS CLI)

## 0. Use `ngrok` to generate an URL

1. [Creat an ngrok account](https://ngrok.com/)

2. Install ngrok

   - Mac

   ```bash
   $ brew install --cask ngrok
   ```

3. Lunch the local server

   ```bash
   $ ngrok http 3000
   ```

Ngrok should only be used for testing.

## 1. Create an app

- [https://api.slack.com/apps](https://api.slack.com/apps) `Create New App` -> `From scratch` -> Enter `App Name` and pick a workspace

- `OAuth & Permissions` -> `Install to Workspace` -> Set the necessary scopes and reinstall the app.

- Set a slash commands. `Slash Commands` -> `Create New Command` -> Set `Request URL` to `<url-generated-by-ngrok>/slack/events` -> `Save`

## 2. Create a directory for the project and install necessary packages

```bash
$ mkdir example-bot
$ cd example-bot
$ npm init

$ npm i @slack/bolt

# TO USE GOOGLE API
$ npm i googleapis

$ npm i aws-sdk
$ npm i aws-serverless-express
$ npm i -D serverless
$ npm i -D serverless-layers
$ npm i -D serverless-offline
$ npm i -D serverless-prune-plugin
```

## 3. Copy the necessary tokens from basic information tab of slack to `.env`

```.env
# Key for Slack API
SLACK_CLIENT_ID=**********
SLACK_CLIENT_SECRET=**********
SLACK_SIGNING_SECRET=**********

# Key for Google Custom Search API
CSE_ID=**********
API_KEY=**********

# AWS SERVICE
SLACK_INSTALLATION_DYNAMODB_NAME=**********
S3_BUCKET_NAME=**********
```

## 4. Code

[Getting started with Bolt for JavaScript](https://slack.dev/bolt-js/tutorial/getting-started)

1. File tree

   ```bash
   ├── app.js
   ├── package-lock.json
   ├── package.json
   ├── node_modules
   ├── serverless.yml
   └── src
       ├── answerBot.js # respond to button
       ├── authorize.js
       ├── commandQueryGenerator.js
       ├── install.js
       ├── refreshTokens.js
       ├── searchImages.js
       └── slashCommand.js
   ```

2. App manifest

   ```yaml
   _metadata:
   major_version: 1
   minor_version: 1
   display_information:
   name: exampleBot
   features:
   bot_user:
     display_name: exampleBot
     always_online: false
   slash_commands:
     - command: /exampleCommand
       url: https://url-generated-by-ngrok/slack/events
       description: A command
       should_escape: false
   oauth_config:
     redirect_urls:
       - https://url-generated-by-ngrok/slack/oauth_redirect
   scopes:
     bot:
       - commands
       - chat:write
       - users:read
       - incoming-webhook
   settings:
   interactivity:
     is_enabled: true
     request_url: https://url-generated-by-ngrok/slack/events
   org_deploy_enabled: false
   socket_mode_enabled: false
   token_rotation_enabled: true
   ```

   - [Official Document of Manifests](https://api.slack.com/reference/manifests)

3. To use Google API

   1. Go to [Google Developers Console](https://console.cloud.google.com/apis/library?pli=1&project=prefab-hangout-293803)

   2. Activate "Custom Search API" and copy the API key to `.env`

   3. Create a [Programmable Search](https://programmablesearchengine.google.com/cse/create/new) and copy the "CSE ID" to `.env`

4. To use Lambda

   1. [Register an AWS account](https://aws.amazon.com/jp/), create an IAM user for the project, and download the access keys. [step-by-step video](https://www.youtube.com/watch?v=KngM5bfpttA).

   2. Install AWS CLI

      ```bash
      # Mac
      $ brew install awscli
      ```

   3. Configure the AWS profile

      ```bash
      $ aws configure
      # AWS Access Key ID [None]: <the-aws-access-key>
      # AWS Secret Access Key [None]: <the-aws-secret>
      # Default region name [None]: us-east-1
      # Default output format [None]: json
      ```

### 5. Deploy to Lambda

```bash
# To test offline
$ sls offline --noPrependStageInUrl

# Deploy
$ sls deploy
```

## Reference

- [Custom Search JSON API](https://developers.google.com/custom-search/v1/overview)

- [Try Custom Search API](https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list#query-parameters)

- [Block Kit Builder](https://app.slack.com/block-kit-builder/)

- [GitHub slackapi/bolt-js](https://github.com/slackapi/bolt-js)

- [Deploying to AWS Lambda ⚡️ Bolt for JavaScript](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda)

- [bolt-js-aws-lambda](https://github.com/seratch/bolt-js-aws-lambda)

- [Add built-in AwsLambdaReceiver](https://github.com/slackapi/bolt-js/issues/784)

- [slack-oauth/app.js](https://github.com/seratch/bolt-js-aws-lambda/blob/main/example/slack-oauth/app.js)

- [Serverless.yml Reference](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml/)

- [Serverless Layers](https://www.serverless.com/plugins/serverless-layers)

- [serverless framework のオススメ設定](https://tech.ga-tech.co.jp/entry/2018/12/12/120000)

- [お手軽に node_modules を AWS Lambda Layers 化する](https://dev.classmethod.jp/articles/serverless-framework-node-modules-to-lambda-layers/)
