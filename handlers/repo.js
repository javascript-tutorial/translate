const config = require('../config');
const debug = require('debug')('handlers:stats');
const Stats = require('../lib/stats');
const { repos } = config.secret;
const request = require('request-promise');

exports.get = async function (ctx) {

  const { lang } = ctx.request.query;

  debug('LANG', lang);

  let repoName, repo;

  let found = false;
  for ([repoName, repo] of Object.entries(repos)) {
    if (repo.lang === lang) {
      found = true;
      break;
    }
  }

  if (!found) {
    return; // 404
  }

  debug('repo', repoName, repo);

  const stats = Stats.instance().get(repoName);

  ctx.body = stats.repo;

};
