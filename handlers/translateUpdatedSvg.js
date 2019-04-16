const crypto = require('crypto');
const config = require('../config');
const debug = require('debug')('handlers:svgStats');
const Stats = require('../lib/stats');
const moment = require('moment');

exports.get = async function(ctx) {

  let langCode = ctx.params.lang;

  if (!config.langs[langCode]) {
    ctx.throw(404);
  }

  const { lastCommit } = Stats.instance().get(langCode);

  let updatedAt = moment(lastCommit.commit.committer.date);

  // console.log(updatedAt.format('DD.MM.YYYY'));

  ctx.type = 'image/svg+xml';
  // ctx.set('cache-control', 'public, max-age=300');

  // github will still proxy and cache it for a few minutes
  ctx.set('cache-control', 'no-cache');

  ctx.body = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="20">
    <text x="0" y="20" color="red">${updatedAt.format('DD.MM.YYYY HH:mm')} UTC</text>
    </svg>`;

};
