const config = require('../config');
const debug = require('debug')('handlers:stats');
const Stats = require('../lib/stats');
const { repos } = config.secret;

exports.get = async function (ctx) {

  const { langs } = ctx.request.query;

  const availableLangs = Object.keys(repos).map(k => repos[k].lang);

  let reqLangs;

  if (langs) {
    reqLangs = langs.split(',');
    for (let i = 0, l = reqLangs.length; i < l; i++) {
      let lang = reqLangs[i];
      if (!availableLangs.includes(lang)) {
        ctx.throw(404);
      }
    }
  } else {
    reqLangs = availableLangs;
  }

  debug('REQUEST LANGS', reqLangs);

  let result = {};

  reqLangs.forEach(lang => {
    let repoName, repo;

    debug('lANG', lang);

    for ([repoName, repo] of Object.entries(repos)) {
      if (repo.lang === lang) break;
    }

    const stats = Stats.instance().get(repoName).translation;
    const { progress, translated } = stats;

    result[lang] = { progress, translated };
  });

  debug('RESULT', result);

  ctx.body = result;

};
