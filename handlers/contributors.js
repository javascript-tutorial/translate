const config = require('../config');
const debug = require('debug')('handlers:stats');
const Stats = require('../lib/stats');
const { repos } = config.secret;
let {mapToObj} = require('../lib/util');

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

  const {files, emailToGithubUser, emailToName} = Stats.instance().get(repoName).contributors;

  let statsByAuthor = Object.create(null);
  // let authorEmailToName = Object.create(null);

  // console.log(files);

  for(let file in files) {
    let {fileStats} = files[file];
    for (let author in fileStats) {
      statsByAuthor[author] = (statsByAuthor[author] || 0) + fileStats[author];
    }
  }

  // remote iliakan@gmail.com, don't count original content author
  // all source code has him as the author, that's a lot already
  if (lang !== 'en' && lang !== 'ru') {
    delete statsByAuthor['iliakan@gmail.com']; //  (actually email below is used)
    delete statsByAuthor['iliakan@users.noreply.github.com'];
  }

  let linesTotal = 0;
  for (let linesCount of Object.values(statsByAuthor)) {
    linesTotal += linesCount;
  }

  let result = new Map();

  // console.log("stats by author", statsByAuthor);

  for (let githubEmail in statsByAuthor) {
    let linesCount = statsByAuthor[githubEmail];

    if (linesCount < 10) {
      // skip contribs who have less than 10 lines
      continue;
    }

    let githubUser = emailToGithubUser[githubEmail];

    if (githubUser) {
      // we know github user with that email
      // let's group all results from other his emails under one entry
      if (result.has(githubUser.login)) {
        result.get(githubUser.login).linesCount += linesCount;
      } else {
        result.set(githubUser.login, {
          githubEmail,
          linesCount,
          githubUser
        });
      }
    } else {
      // email is the key if we don't know such user
      result.set(githubEmail, {
        githubEmail,
        linesCount,
        githubUser
      });
    }
  }


  for (let value of result.values()) {
    value.percent = (value.linesCount / linesTotal * 100).toFixed(2);
    value.name = emailToName[value.githubEmail];
  }

  // console.log(result.entries());
  result = new Map(Array.from(result).sort((a, b) => b[1].linesCount - a[1].linesCount));

  // console.log(result);

  ctx.body = mapToObj(result);

};
