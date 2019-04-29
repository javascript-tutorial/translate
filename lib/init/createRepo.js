const config = require("../../config");
const debug = require('debug')('init:createRepo');
const Octokit = require('@octokit/rest');
const path = require('path');
const fs = require('mz/fs');
const run = require('../run');
const updateLocalRepo = require('../updateLocalRepo');
const _ = require('lodash');

const octokit = new Octokit({
  auth:     `token ${config.secret.github.token}`,
  log: console,
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
    await run(`git clone git@github.com:${config.org}/${config.langMain}.${config.repoSuffix}`, {
      cwd: config.repoRoot
    });
    debug("Created local original repo");
  }


  const repo = `${langInfo.code}.${config.repoSuffix}`;

  debug("Checking if remote repo exists");

  const {data} = await octokit.search.repos({
    q: `org:${config.org} "${repo}"`,
  });

  // when we search for "br.javascript.info", it also finds "pt-br.javascript.info", so check for exact match
  let remoteRepoExists = data.items.some(item => item.full_name === `${config.org}/${repo}`);

  if (remoteRepoExists) {
    debug("Translated remote repo exists");

    await setupRepo(langInfo);

    await updateLocalRepo(langInfo.code);

    debug("Translated local repo ready");
    return;
  }

/*
  let localRepoPath = path.join(config.repoRoot, `${langInfo.code}.${config.repoSuffix}`);
  let localRepoExists = await fs.exists(localRepoPath);

  debug("Local translated repo exists: " + localRepoExists);

  if (localRepoExists) {
    debug("When local repo exists, we assume it's up to date");
    return;
  }
*/

  debug("No translated remote and local repo: cloning, initializing");

  await octokit.repos.createInOrg({
    org:         config.org,
    name:        repo,
    description: `Modern JavaScript Tutorial in ${langInfo.name}`,
  });

  debug("Translated remote repo created");

  // clear initial labels
  let {data: labels} = await octokit.issues.listLabelsForRepo({
    owner,
    repo
  });

  // Allow repo to have own labels, just ensure it has standard labels too

  for(let label of labels) {
    await octokit.issues.deleteLabel({
      owner: config.org,
      repo,
      name: label.name
    });
  }

  debug("Labels cleared");


  await setupRepo(langInfo);

  debug("Cloning local translated repo");

  await run(`git clone --no-local ${config.langMain}.${config.repoSuffix} ${langInfo.code}.${config.repoSuffix}`, {
    cwd: config.repoRoot
  });

  debug("Created local translated repo");

  await run(`git remote set-url origin git@github.com:${config.org}/${langInfo.code}.${config.repoSuffix}`, {
    cwd: localRepoPath
  });
  await run(`git remote add upstream git@github.com:${config.org}/${config.langMain}.${config.repoSuffix}`, {
    cwd: localRepoPath
  });

  debug("Pushing to remote");

  await run(`git push -u origin master`, {
    cwd: localRepoPath
  });

  debug("Translated remote repo is initialized");

};

async function setupRepo(langInfo) {

  debug("setupRepo");

  const repo = `${langInfo.code}.${config.repoSuffix}`;
  const owner = config.org;

  // Set topics

  let langTopic = langInfo.name
    .toLowerCase()
    .replace(/[() ]/g, ' ')
    .trim()
    .replace(/ +/, '-');

  await octokit.repos.replaceTopics({
    owner,
    repo,
    names: ["javascript", "tutorial", langTopic]
  });

  // General repo settings

  await octokit.repos.update({
    owner,
    repo,
    name:               repo,
    has_projects:       false,
    has_wiki:           false,
    homepage:           typeof langInfo.published === 'string' ? langInfo.published :
                          langInfo.published ? `https://${langInfo}.javascript.info` : `https://javascript.info`,
    allow_merge_commit: true,
    allow_squash_merge: false,
    allow_rebase_merge: false
  });


  // Hooks

  let {data: hooks} = await octokit.repos.listHooks({
    owner,
    repo
  });

  for (let hook of hooks) {
    debug("Deleting old hook", hook);
    await octokit.repos.deleteHook({
      owner,
      repo,
      hook_id: hook.id
    });
  }

  if (repo === 'test.javascript.info' || repo === 'ru.javascript.info') {
    debug("Create new hook");
    let {data: result} = await octokit.repos.createHook({
      owner,
      repo,
      // by default only push
      // events: ['pull_request', 'pull_request_review', 'pull_request_review_comment'],
      events: ['*'],
      config: {
        url: repo === 'text.javascript.info' ? 'http://testhook.javascript.ru/hook' : 'https://translate.javascript.info/hook',
        content_type: 'json',
        secret: config.secret.github.hook
      }
    });
    debug("Created hook", result);

    // Labels
    let {data: labels} = await octokit.issues.listLabelsForRepo({
      owner,
      repo
    });

    labels = _.keyBy(labels, 'name');

    // Allow repo to have own labels, just ensure it has standard labels too

    for(let label of Object.values(config.labels)) {
      if (!labels[label.name]) {
        debug("No such label, creating", label);
        octokit.issues.createLabel({
          owner,
          repo,
          ...label
        });
      }
    }

  }

}
