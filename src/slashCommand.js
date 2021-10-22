'use strict';

const searchImages = require('./searchImages');
const slashCommand = (cxId, apiKey) => async (command, client, respond) => {
  let result, processResult;
  const text = command.text;

  if (!text) {
    result = {
      attachments: [
        {
          text: 'Please tell me what to search!',
          color: 'warning'
        }
      ]
    };
    respond(result);
    return;
  }

  const [keyword, number] = text.split(/,+|、+|。+/);
  const googleError = {
    attachments: [
      {
        text: 'Sorry, there are something wrong with photo searching🥺',
        color: 'warning'
      }
    ]
  };
  const msgError = {
    attachments: [
      {
        text: 'Sorry, there are something wrong with the program.',
        color: 'warning'
      }
    ]
  };

  const userInfo = await client.users
    .info({
      user: command.user_id
    })
    .catch(err => {
      console.log('Failed to get user info: ', err.data);
      return {
        user: {
          profile: {
            image_32: `http://fakeimg.pl/32x32?text=${command.user_name}&font=bebas`,
            display_name: command.user_name
          }
        }
      };
    });

  const userProfile = userInfo.user.profile;

  let imgUrl;
  if (number === undefined || isNaN(number)) {
    const query = number === undefined ? keyword : text;
    imgUrl = await searchImages(query, 1, cxId, apiKey).catch(err => {
      respond(googleError);
      console.log(err);
      return false;
    });
    if (imgUrl !== false) {
      result = {
        response_type: 'in_channel',
        blocks: [
          {
            type: 'context',
            elements: [
              {
                type: 'image',
                image_url: userProfile.image_32,
                alt_text: userProfile.display_name
              },
              {
                type: 'mrkdwn',
                text: `${userProfile.display_name} feel: ${query}`
              }
            ]
          },
          {
            type: 'image',
            image_url: imgUrl,
            alt_text: query
          }
        ]
      };
      processResult = await respond(result).catch(err => {
        respond(msgError);
        console.log(err, result);
      });
    }
  } else {
    const num = parseInt(number);
    imgUrl = await searchImages(keyword, num, cxId, apiKey).catch(err => {
      respond(googleError);
      console.log(err);
      return false;
    });

    if (imgUrl !== false) {
      let theBlock = [];

      if (num === 1) {
        theBlock = [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'I found it!'
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'image',
            image_url: imgUrl,
            alt_text: keyword
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'Should I send it?'
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: `Send!`
                },
                value: `${imgUrl},${keyword},${userProfile.image_32},${userProfile.display_name}`,
                action_id: `select_stamp_send`
              }
            ]
          }
        ];
      } else {
        theBlock = [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'See what I found!',
              emoji: true
            }
          },
          {
            type: 'divider'
          }
        ];

        imgUrl.forEach((url, i) => {
          const secText = `Photo ${i + 1}`;
          const section = {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: secText
            },
            accessory: {
              type: 'image',
              image_url: url,
              alt_text: `${keyword} ${i + 1}`
            }
          };
          theBlock.push(section);
        });

        const action = {
          type: 'actions',
          elements: []
        };

        theBlock.push({ type: 'divider' });
        theBlock.push({
          type: 'section',
          text: {
            type: 'plain_text',
            text: 'Which should I send?',
            emoji: true
          }
        });
        theBlock.push(action);

        imgUrl.forEach((url, i) => {
          theBlock[theBlock.length - 1]['elements'].push({
            type: 'button',
            text: {
              type: 'plain_text',
              text: `Photo ${i + 1}`
            },
            value: `${url},${keyword},${userProfile.image_32},${userProfile.display_name}`,
            action_id: `select_stamp_${i + 1}`
          });
        });
      }

      theBlock[theBlock.length - 1]['elements'].push({
        type: 'button',
        text: {
          type: 'plain_text',
          text: `Cancel`
        },
        value: 'delete',
        action_id: `select_stamp_delete`
      });

      result = {
        response_type: 'ephemeral',
        blocks: theBlock
      };
      // await respond(result);
      processResult = await respond(result).catch(err => {
        respond(msgError);
        console.log(err, result);
      });
    }
  }
};

module.exports = slashCommand;
