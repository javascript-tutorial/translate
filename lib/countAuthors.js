const fs = require('mz/fs');
const path = require('path');
const exec = require('mz/child_process').exec;
const run = require('./run');
const debug = require("debug")('lib:countAuthors');

const countFileAuthorStats = require('./countFileAuthorStats');
const fetchGithubUserByQuery = require('./fetchGithubUserByQuery');
const githubEmailMap = require('../githubEmailMap.json');

async function countAuthors(repoPath, contributorsCache) {

  if (contributorsCache.commit) {
    let diff = await run(`git diff --name-only ${contributorsCache.commit} HEAD`, {
      cwd: repoPath
    });
    let changedFiles = diff.trim().split('\n');
    for(let file of changedFiles) {
      delete contributorsCache.files[file];
    }
  } else {
    contributorsCache.files = Object.create(null);
  }


  let stdout = await run('git grep -Il ""', { // ls-files returns binary files, this doesn't
    cwd:       repoPath
  });

  let files = stdout.split(/\n/).map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < files.length; i++) {
    let file = files[i];

    if (file[0] === '.' || file.includes('/.')) {
      delete contributorsCache.files[file];
      continue; // system file, ignore it
    }

    if (file.includes('.view')) {
      // ignore big test files from view
      let fileStat = await fs.stat(path.resolve(repoPath, file));
      if (fileStat.size > 60e3) {
        delete contributorsCache.files[file];
        continue;
      }
    }

    debug(file, i, files.length);

    if (!contributorsCache.files[file]) {
      contributorsCache.files[file] = await countFileAuthorStats(repoPath, file);
    }

  }

  debug("stats", contributorsCache.files);

  contributorsCache.commit = (await run(`git rev-parse --short HEAD`, {
    cwd: repoPath
  })).trim(); // output ends with \n

  let statsByAuthor = Object.create(null);

  for(let file in contributorsCache.files) {
    let fileStats = contributorsCache.files[file];
    for (let author in fileStats) {
      statsByAuthor[author] = (statsByAuthor[author] || 0) + fileStats[author];
    }
  }

  debug("stats by author", statsByAuthor);

  // build email cache

  let emailToGithubUser = contributorsCache.emailToGithubUser || Object.create(null);

  for (let githubEmail in statsByAuthor) {
    let linesCount = statsByAuthor[githubEmail];

    if (linesCount < 10) {
      // skip contributors who have less than 10 lines
      continue;
    }

    let githubUser = emailToGithubUser[githubEmail];


    // console.log("GITHUBUSER", githubUser);
    // console.log("EMAILTOGITHUBUSER", emailToGithubUser);
    if (!(githubEmail in emailToGithubUser)) { // may be empty

      if (githubEmailMap[githubEmail]) {
        let login = githubEmailMap[githubEmail];
        githubUser = await fetchGithubUserByQuery(`${login} in:login`);
      } else if (githubEmail.endsWith('@users.noreply.github.com')) {
        let login = githubEmail.slice(0, -'@users.noreply.github.com'.length);
        githubUser = await fetchGithubUserByQuery(`${login} in:login`);
      } else {
        githubUser = await fetchGithubUserByQuery(`${githubEmail} in:email`);
      }

      // couldn't find github user =(
      if (!githubUser) {
        debug("Error: No github user for " + githubEmail);
      }

      emailToGithubUser[githubEmail] = githubUser || null;
    }
  }

  contributorsCache.emailToGithubUser = emailToGithubUser;

  debug(contributorsCache);

}

module.exports = countAuthors;

//countAuthors('/js/javascript-tutorial-zh', {});
