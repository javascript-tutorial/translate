const config = require("../config");
const debug = require('debug')('tasks:sync');
const Octokit = require('@octokit/rest');
const sync = require('../lib/sync');


module.exports = async () => {

  let args = require('yargs')
    .demand('lang')
    .argv;

  let langInfo = require('../langs/' + args.lang);

  await sync(langInfo);

};

