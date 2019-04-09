const fs = require('mz/fs');
const path = require('path');
const exec = require('mz/child_process').exec;
const run = require('./run');
const request = require('request-promise');
const debug = require("debug")('lib:countAuthors');
const config = require('../config');
const countGithubFileAuthorStats = require('./countGithubFileAuthorStats');

async function countAuthors(repoName, contributorsCache) {

  let repoPath = path.join(config.repoRoot, path.basename(repoName));

  let currentHead = (await run(`git rev-parse --short HEAD`, {
    cwd: repoPath
  })).trim(); // output ends with \n

  if (contributorsCache.commit) {
    let diff = await run(`git diff --name-only ${contributorsCache.commit} ${currentHead}`, {
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

    if (files.startsWith('archive/')) {
      continue;
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
      try {
        contributorsCache.files[file] = await countGithubFileAuthorStats(repoName, file, currentHead);
      } catch(err) {
        // 'name', 'status', 'headers', 'request', 'data', 'errors'
        if (err.name === 'HttpError' && err.status === 502) { // retry
          contributorsCache.files[file] = await countGithubFileAuthorStats(repoName, file, currentHead);
          // console.log("HTTP ERROR", Object.keys(err), err, '...HTTP ERROR' + err.status);
          // throw err;
        } else {
          throw err;
        }
      }
    }

  }

  debug("stats", contributorsCache.files);

  contributorsCache.commit = currentHead;

  return contributorsCache;
}

module.exports = countAuthors;

//countAuthors('/js/javascript-tutorial-zh', {});
