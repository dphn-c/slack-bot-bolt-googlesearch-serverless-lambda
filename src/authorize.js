'use strict';

const authorizeFn = fetchFn => async source => {
  try {
    const queryResult = await fetchFn(source);
    if (queryResult === undefined) {
      throw new Error('Failed to get the data.');
    }

    const authorizeResult = {};
    if (queryResult.team !== undefined) {
      authorizeResult.teamId = queryResult.team.id;
    } else if (source.teamId !== undefined) {
      authorizeResult.teamId = source.teamId;
    }
    if (queryResult.enterprise !== undefined) {
      authorizeResult.enterpriseId = queryResult.enterprise.id;
    } else if (source.enterpriseId !== undefined) {
      authorizeResult.enterpriseId = source.enterpriseId;
    }
    if (queryResult.user !== undefined) {
      authorizeResult.userToken = queryResult.user.token;
    }
    if (queryResult.bot !== undefined) {
      authorizeResult.botToken = queryResult.bot.token;
      authorizeResult.botId = queryResult.bot.id;
      authorizeResult.botUserId = queryResult.bot.userId;
    }
    return authorizeResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = authorizeFn;
