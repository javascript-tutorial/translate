
const config = require("../../config");
const debug = require('debug')('init:createRepo');
const Octokit = require('@octokit/rest');
const path = require('path');
const fs = require('mz/fs');
const run = require('../run');

const octokit = new Octokit({
  auth: `token ${config.secret.github.token}`,
  previews: ['hellcat-preview', 'mercy-preview'], // enables nested teams API
});


// if original local repo doesn't exist => create it
// if translated local repo exists => we're done
//   otherwise
//     if translated remote repo exists => clone it, set upstream
//     otherwise create translated local and remote repos
module.exports = async function(langInfo) {

  let originalPath = path.join(config.repoRoot, `${config.langMain}.${config.repoSuffix}`);
  let existsOriginal = await fs.exists(originalPath);

  debug("Local original repo exists: " + existsOriginal);

  if (!existsOriginal) {
    debug("Cloning local original repo");
    await run(`git clone https://github.com/${config.org}/${config.langMain}.${config.repoSuffix}`, {
      cwd: config.repoRoot
    });
    debug("Created local original repo");
  }

  let translatedPath = path.join(config.repoRoot, `${langInfo.code}.${config.repoSuffix}`);
  let existsTranslated = await fs.exists(translatedPath);

  const newRepoName = `${langInfo.code}.${config.repoSuffix}`;


  await octokit.repos.replaceTopics({
    owner: config.org,
    repo: newRepoName,
    names: ["javascript", "tutorial", langInfo.name.toLowerCase()]
  });


  debug("Local translated repo exists: " + existsTranslated);

  if (existsTranslated) {
    debug("When local repo exists, we assume it's up to date");
    return;
  }

  debug("Checking if remote repo exists");

  const { data: {total_count} } = await octokit.search.repos({
    q: `org:${config.org} "${newRepoName}"`,
  });

  if (total_count > 0) {
    debug("Translated remote repo exists, clone it locally");

    await run(`git clone https://github.com/${config.org}/${langInfo.code}.${config.repoSuffix}`, {
      cwd: config.repoRoot
    });

    debug("Set remote upstream to the main version");

    await run(`git remote add upstream https://github.com/${config.org}/${config.langMain}.${config.repoSuffix}`, {
      cwd: translatedPath
    });

    debug("Translated local repo ready");

    return;
  }

  debug("No translated local and remote repo: cloning, initializing");

  await octokit.repos.createInOrg({
    org: config.org,
    name: newRepoName,
    description: `Modern JavaScript Tutorial in ${langInfo.name}`,
  });

  debug("Translated remote repo created");


  debug("Adding topics");

  await octokit.repos.replaceTopics({
    owner: config.org,
    repo: newRepoName,
    names: ["javascript", "tutorial", langInfo.name]
  });

  debug("Cloning local translated repo");

  await run(`git clone --no-local ${config.langMain}.${config.repoSuffix} ${langInfo.code}.${config.repoSuffix}`, {
    cwd: config.repoRoot
  });

  debug("Created local translated repo");

  await run(`git remote set-url origin https://github.com/${config.org}/${langInfo.code}.${config.repoSuffix}.git`, {
    cwd: translatedPath
  });
  await run(`git remote add upstream https://github.com/${config.org}/${config.langMain}.${config.repoSuffix}.git`, {
    cwd: translatedPath
  });

  debug("Pushing to remote");

  await run(`git push -u origin master`, {
    cwd: translatedPath
  });

  debug("Translated remote repo is initialized");

};
