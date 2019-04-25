
const config = require("../config");
const debug = require('debug')('tasks:repo');
const Octokit = require('@octokit/rest');
const createRepo = require('../lib/init/createRepo');
const createTeam = require('../lib/init/createTeam');
const createProgressIssue = require('../lib/init/createProgressIssue');

const octokit = new Octokit({
  auth: `token ${config.secret.github.token}`,
  previews: ['hellcat-preview'], // enables nested teams API
});

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

    await createRepo(langInfo);

    await createProgressIssue(langInfo);

    await createTeam(langInfo);
  }
};
