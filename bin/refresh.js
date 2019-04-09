const config = require("../config");
const fse = require('fs-extra');
const path = require('path');
const run = require('../lib/run');
const execSync = require('child_process').execSync;
const Stats = require('../lib/stats');
const debug = require('debug')('init');
const updateRepo = require('../lib/updateRepo');

(async function () {

  for (let repoName in config.secret.repos) {
    let repoConfig = config.secret.repos[repoName];

    await updateRepo(repoName);
  }

  for (let repoName in config.secret.repos) {
    let repoConfig = config.secret.repos[repoName];

    // fixme
    // if (repoConfig.lang !== 'zh') continue;

    await Stats.instance().gather(repoName);
  }

})().catch(console.error);
