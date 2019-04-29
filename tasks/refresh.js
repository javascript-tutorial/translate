const config = require("../config");
const fse = require('fs-extra');
const path = require('path');
const run = require('../lib/run');
const execSync = require('child_process').execSync;
const Stats = require('../lib/stats');
const debug = require('debug')('init');
const updateLocalRepo = require('../lib/updateLocalRepo');

module.exports = async function () {

  for (let lang in config.langs) {
    await updateLocalRepo(lang);
  }

  for (let lang in config.langs) {
    // if (lang !== 'zh') continue;

    await Stats.instance().gather(lang);
  }

};
