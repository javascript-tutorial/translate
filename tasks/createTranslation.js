
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
    .demand('lang')
    .argv;

  let langInfo = require('../langs/' + args.lang);

  const originalUrl = `https://github.com/${config.org}/${config.langMain}.${config.repoSuffix}`;

  const newRepoName = `${langInfo.code}.${config.repoSuffix}`;
  const newRepoUrl = `https://github.com/${config.org}/${newRepoName}.git`;


  await createRepo(langInfo);

  await createProgressIssue(langInfo);

  await createTeam(langInfo);

};
