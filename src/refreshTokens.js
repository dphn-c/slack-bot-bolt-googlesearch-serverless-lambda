'use strict';

const refreshTokensFn =
  (SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, fetchDataFn, refreshDataFn, oauth) => async query => {
    const teamTokens = await fetchDataFn(query).catch(err => {
      console.log('Failed to get tokens', err.data);
      return { bot: { refreshToken: 'unableToGetTokens' } };
    });

    const botTokens = await oauth({
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: teamTokens.bot.refreshToken
    }).catch(err => {
      console.log('Failed to get the user bot token', err.data);
      return { refresh_token: 'unableToGetToken' };
    });

    const userTokens = await oauth({
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: teamTokens.user.refreshToken
    }).catch(err => {
      console.log('Failed to get the user token', err.data);
      return { refresh_token: 'unableToGetToken' };
    });

    teamTokens.user.refreshToken = userTokens.refresh_token;
    teamTokens.user.token = userTokens.access_token;
    teamTokens.bot.refreshToken = botTokens.refresh_token;
    teamTokens.bot.token = botTokens.access_token;

    await refreshDataFn(teamTokens).catch(err => {
      console.log('Failed to refresh tokens', err.data);
    });
  };

module.exports = refreshTokensFn;
