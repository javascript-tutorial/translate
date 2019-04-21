const config = require("../config");
const debug = require('debug')('tasks:sync');
const Octokit = require('@octokit/rest');
const sync = require('../lib/sync');


module.exports = async () => {

  for(let langInfo of Object.values(config.langs)) {
    await sync(langInfo)
  }

};

