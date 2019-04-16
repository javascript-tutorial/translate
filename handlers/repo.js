const config = require('../config');
const debug = require('debug')('handlers:stats');
const Stats = require('../lib/stats');
const { repos } = config.secret;
const request = require('request-promise');

exports.get = async function (ctx) {

  const { lang } = ctx.request.query;

  debug('LANG', lang);

  const stats = Stats.instance().get(lang);

  if (!stats) {
    ctx.throw(404);
  }

  ctx.body = stats.repo;

};
