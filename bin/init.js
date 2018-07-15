
const config = require("../config");
const fse = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;

fse.emptyDirSync(config.repoRoot);
execSync(`touch .gitkeep`, {cwd: config.repoRoot});

for(let repoName in config.secret.repos) {
  let repo = config.secret.repos[repoName];

  execSync(`git clone --depth 1 https://github.com/${repoName}.git`, {cwd: config.repoRoot})
}