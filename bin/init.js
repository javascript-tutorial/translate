
const config = require("../config");
const fse = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;
const Stats = require('../lib/stats');

fse.removeSync(config.repoRoot);
fse.mkdirsSync(config.repoRoot);

for(let repoName in config.secret.repos) {
  let repo = config.secret.repos[repoName];


  execSync(`git clone --depth 1 https://github.com/${repoName}.git`, {cwd: config.repoRoot});
}

(async function() {

  for (let repoName in config.secret.repos) {
    await Stats.instance().count(repoName);
  }

})().catch(console.error);