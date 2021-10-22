'use strict';

const dynamoInstallationStore = (dynamo, table) => {
  return {
    storeInstallation: async installation => {
      const enterpriseId = installation.enterprise ? installation.enterprise.id : 'none';
      const teamId = installation.team ? installation.team.id : 'none';
      const installInfo = {
        TableName: table,
        Item: {
          userID: `${enterpriseId}-${teamId}`,
          info: JSON.stringify(installation)
        }
      };
      await dynamo
        .put(installInfo, err => {
          if (err) {
            console.error('Unable to install the app.');
          } else {
            console.log('Installation completed!');
          }
        })
        .promise();
    },
    fetchInstallation: async query => {
      const enterpriseId = query.enterpriseId ? query.enterpriseId : 'none';
      const teamId = query.teamId ? query.teamId : 'none';
      const key = query.isEnterpriseInstall ? `${enterpriseId}-none` : `${enterpriseId}-${teamId}`;
      const queryInfo = {
        TableName: table,
        Key: {
          userID: key
        }
      };
      const res = await dynamo
        .get(queryInfo, err => {
          if (err) console.error('Unable to get item.');
          else console.log('Get item successfully!');
        })
        .promise();
      return JSON.parse(res.Item.info.toString('utf-8'));
    }
  };
};

module.exports = dynamoInstallationStore;
