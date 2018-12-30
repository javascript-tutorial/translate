const crypto = require('crypto');
const config = require('../config');
const debug = require('debug')('handlers:svgStats');
const Stats = require('../lib/stats');
const { repos } = config.secret;

exports.get = async function(ctx) {

  let lang = ctx.params.lang;

  let repo, repoName;

  let availableLangs = Object.keys(repos).map(k => repos[k].lang);

  if (availableLangs.indexOf(lang) < 0 || lang === 'en') {
    ctx.throw(404);
  }

  for([repoName, repo] of Object.entries(repos)) {
    if (repo.lang === lang) break;
  }

  const { progress } = Stats.instance().get(repoName);

  ctx.type = 'image/svg+xml';
  // ctx.set('cache-control', 'public, max-age=300');

  // github will still proxy and cache it for a few minutes
  ctx.set('cache-control', 'no-cache');

  ctx.body = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="20">
    <text x="0" y="20" color="red">${progress}%</text>
    </svg>`;

};
