const config = require("../config");
const path = require("path");
const run = require('./run');
const fs = require('fs');
const debug = require('debug')('updateRepo');

module.exports = async function (langCode) {
  let repoDir = path.join(config.repoRoot, `${langCode}.javascript.info`);

  debug("Update local repo", langCode);

  if (fs.existsSync(repoDir)) {

    debug("Local repo exists, fetch latest and clean it");
    await run(`git fetch origin master`, {cwd: repoDir});
    await run(`git checkout -f -B master origin/master`, {cwd: repoDir});
    await run(`git clean -df`, {cwd: repoDir});

  } else {

    debug("No local repo, clone it");

    // full clone(!)
    // git blame gives wrong author with --depth 1
    await run(`git clone https://github.com/${config.org}/${langCode}.javascript.info.git`, { cwd: config.repoRoot });

  }

  debug("Local repo updated", langCode);

};


