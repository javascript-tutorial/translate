const config = require('../config');
const debug = require('debug')('handlers:stats');
const Stats = require('../lib/stats');

exports.get = async function (ctx) {

  let { langs } = ctx.request.query;

  if (!langs) {
    ctx.throw(404);
  }

  langs = langs.split(',');

  debug('REQUEST LANGS', langs);

  let result = {};
  for (lang of langs) {
    if (!config.langs[lang]) {
      ctx.throw(404);
    }

    const stats = Stats.instance().get(lang).translation;

    const { progress, translated } = stats; // take only these two

    result[lang] = { progress, translated };
  }

  debug('RESULT', result);

  ctx.body = result;

};
