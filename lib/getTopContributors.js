const config = require('config');
const request = require('request-promise');
const fs = require('mz/fs');
const path = require('path');
const execFile = require('mz/child_process').execFile;
const exec = require('mz/child_process').exec;
const assert = require('assert');

const getRepoAuthorStats = require('./getRepoAuthorStats');
const fetchGithubUserByQuery = require('./fetchGithubUserByQuery');


module.exports = async function(repoRoot) {

  let stats = await getRepoAuthorStats(repoRoot);

  let linesTotal = 0;
  for (let linesCount of stats.values()) {
    linesTotal += linesCount;
  }
  // console.log("LINES TOTAL", linesTotal);

  console.log(stats);
  let results = new Map();
  for (let [githubEmail, linesCount] of stats) {
    if (linesCount < 100) {
      // skip contribs who have less than 100 lines
      continue;
    }

    let githubUser;
    if (githubEmail.endsWith('@users.noreply.github.com')) {
      let login = githubEmail.slice(0, -'@users.noreply.github.com'.length);
      githubUser = await fetchGithubUserByQuery(`${login} in:login`);
    } else {
      githubUser = await fetchGithubUserByQuery(`${githubEmail} in:email`);
    }

    // couldn't find github user? don't show this contributor =(
    if (!githubUser) {
      console.error("Error: No github user for " + githubEmail);
      continue;
    }

    if (results.has(githubUser.login)) {
      results.get(githubUser.login).linesCount += linesCount;
    } else {
      results.set(githubUser.login, {
        githubEmail,
        linesCount,
        githubUser
      });
    }

    for (let value of results.values()) {
      value.percent = (value.linesCount / linesTotal * 100).toFixed(2);
    }


  }

  console.log(results);

  return results;
};
