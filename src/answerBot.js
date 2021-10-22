'use strict';

const answerBot = async (action, respond) => {
  let result;

  const { action_id, value } = action;

  if (value === 'delete') {
    result = {
      response_type: 'ephemeral',
      text: '',
      delete_original: 'true'
    };
  } else {
    const [url, keyword, userImg, userName] = value.split(',');
    result = {
      response_type: 'in_channel',
      delete_original: 'true',
      blocks: [
        {
          type: 'context',
          elements: [
            {
              type: 'image',
              image_url: userImg,
              alt_text: userName
            },
            {
              type: 'mrkdwn',
              text: `${userName} feel: ${keyword}`
            }
          ]
        },
        {
          type: 'image',
          image_url: url,
          alt_text: action_id
        }
      ]
    };
  }

  await respond(result).catch(err => {
    respond({
      attachments: [
        {
          text: 'Sorry, there were something wrong with the program. Please try again.',
          color: 'warning'
        }
      ]
    });
    console.log(err);
  });
};

module.exports = answerBot;
