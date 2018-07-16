const crypto = require('crypto');
const config = require('../config');
const debug = require('debug')('handlers:stats');
const Stats = require('../lib/stats');

exports.get = async function(ctx) {

  let lang = ctx.params.lang;

  let repo, repoName;

  for([repoName, repo] of Object.entries(config.secret.repos)) {
    if (repo.lang === lang) break;
  }

  if (!repo) {
    this.throw(404);
  }

  let stats = Stats.instance().get(repoName);

  let percentage = Math.floor(stats.filesTranslated / stats.filesTotal * 100);

  ctx.type = 'image/svg+xml';
  ctx.set('cache-control', 'public, max-age=300');

  ctx.body = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="20">
    <text x="0" y="20" color="red">${percentage}%</text>
    </svg>`;

};