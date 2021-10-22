'use strict';

const { google } = require('googleapis');
const customSearch = google.customsearch('v1');

const searchImages = async (kw, num, cxId, apiKey) => {
  const result = await customSearch.cse
    .list({
      cx: cxId,
      q: kw,
      auth: apiKey,
      imgSize: 'medium',
      searchType: 'image',
      num: num
    })
    .catch(err => {
      console.log('Failed to search the images', err);
    });
  const imgUrl = num === 1 ? result.data?.items[0].link : result.data?.items.map(item => item.link);
  return imgUrl;
};

module.exports = searchImages;
