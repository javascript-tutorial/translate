const config = require("../config");
const debug = require('debug')('tasks:sync');
const Octokit = require('@octokit/rest');
const sync = require('../lib/sync');


module.exports = async () => {

  let args = require('yargs')
    .argv;

  if (!args.lang && !args.all) {
    throw new Error("Must have --lang or --all");
  }


  if (args.lang && !config.langs[args.lang]) {
    throw new Error("No such language");
  }


  let langs = args.all ? Object.values(config.langs).filter(l => l.code !== 'en') : [config.langs[args.lang]];

  for(let langInfo of langs) {
    await sync(langInfo);
  }

};

