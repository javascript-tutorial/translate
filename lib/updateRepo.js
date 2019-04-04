const config = require("../config");
const path = require("path");
const run = require('./run');
const fs = require('fs');

module.exports = async function (repoName) {
  let repoDir = path.join(config.repoRoot, path.basename(repoName));

  let repoConfig = config.secret.repos[repoName];

  let branch = repoConfig.branch || 'master';

  if (fs.existsSync(repoDir)) {

    await run(`git fetch origin ${branch}`, {cwd: repoDir});

  } else {

    // full clone(!)
    // git blame gives wrong author with --depth 1
    await run(`git clone https://github.com/${repoName}.git "${repoDir}"`);

  }

  await run(`git checkout -f origin/${branch}`, {cwd: repoDir});

};


