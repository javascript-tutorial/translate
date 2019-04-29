
const config = require("../config");
const debug = require('debug')('lib:sync');
const Octokit = require('@octokit/rest');
const updateLocalRepo = require('../lib/updateLocalRepo');
const run = require('../lib/run');
const path = require('path');

const octokitBot = new Octokit({
  auth: `token ${config.secret.github.tokenBot}`,
  // log: console
});

module.exports = async (langInfo) => {

  await updateLocalRepo(langInfo.code);

  let translatedPath = path.join(config.repoRoot, `${langInfo.code}.${config.repoSuffix}`);

  await run(`git fetch upstream master`, { cwd: translatedPath });

  const hash = await run(`git rev-parse upstream/master`, { cwd: translatedPath });

  const shortHash = hash.slice(0, 8);

  const syncBranch = `sync-${shortHash}`;

  await run(`git checkout -B ${syncBranch} master`, {cwd: translatedPath});

  // Pull from {source}/master

  let output;
  try {
    output = await run(`git pull upstream master`, {cwd: translatedPath});
  } catch(err) {
    if (err.code === 1 && err.stdout.trim().endsWith('Automatic merge failed; fix conflicts and then commit the result.')) {
      // merge failed, let's handle the output
      output = err.stdout;
    } else {
      throw err;
    }
  }

  if (output.includes('Already up to date.')) {
    debug(`We are already up to date with upstream`);
    return;
  }

  let conflictFiles = await run(`git diff --name-only --diff-filter=U`, {cwd: translatedPath });
  conflictFiles = conflictFiles.split('\n');

  // if (conflictFiles[0] === 'Readme.md' && conflictFiles.length === 1) {
  //   await run(`git checkout --ours Readme.md`, {cwd: translatedPath });
  //   await run(`git commit -m 'readme only' Readme.md`, {cwd: translatedPath });
  // }

  if (conflictFiles[0] === '') conflictFiles.shift(); // if no conflicts,  conflictFiles becomes ['']

  if (conflictFiles.length) {
    await run(`git commit -am "merging all conflicts"`, {cwd: translatedPath});
  } else {
    // If no conflicts, merge directly into master
    debug('No conflicts found. Committing directly to master.');
    await run(`git checkout master`, {cwd: translatedPath});
    await run(`git merge ${syncBranch}`, {cwd: translatedPath});
    await run(`git push origin master`, {cwd: translatedPath});
    debug("master updated, done");
    return;
  }

  debug('conflict files: ', conflictFiles.join('\n'));

  // Create a new pull request, listing all conflicting files
  await run(`git push --force --set-upstream origin ${syncBranch}`, {cwd: translatedPath});

  const title = `Sync with upstream @ ${shortHash}`;

  let conflictList = conflictFiles.map(
    file => `- [ ] [${file}](/${config.org}/${config.langMain}.${config.repoSuffix}/commits/master/${file})`
  ).join('\n');

  if (conflictFiles.length > 20) {
    conflictList = `<details><summary>Click to open a list of ${conflictFiles.length} files</summary>\n\n${conflictList}\n</details>`;
  }

  const readmeTip = conflictFiles.map(f => f.toLowerCase()).includes('readme.md') ? '\nPlease ignore changes in Readme.md (git checkout --ours Readme.md && git commit -m ignore Readme.md).\n' : '';

  if (conflictList) {
    conflictList = `
The following files have conflicts and may need new translations:

${conflictList}

Please fix the conflicts by pushing new commits to this pull request, either by editing the files directly on GitHub or by checking out this branch.
`;
  } else {
    conflictList = 'No conflicts were found.';
  }

  let tips = '';
  if (conflictList) {
    tips = `
We recommend to close this PR and merge conflicting changes manually.

The steps are: 
1. Add remote upstream that links to the English version (only needs to be done once)
    - \`git add remote upstream https://github.com/javascript-tutorial/en.javascript.info\` 
2. Commit all current work locally and \`git checkout master\`
3. Pull the recent changes from the English version:
    - \`git pull upstream master\`
4. Deal with the conflicts. If a conflict touches a few lines, then just fix them. Otherwise, following commands can help:
    - Checkout translated version of a file/folder at the given path:
        - \`git checkout --ours <path>\`
    - Checkout upstream version of a file/folder at the given path:
        - \`git checkout --theirs <path>\`
    - See what changed in the upstream file since branches diverged: 
        - \`git diff --word-diff master...upstream/master <path>\` (please note: three dots in the command)
5. When conflicts resolved, commit them and \`git push origin master\`
${readmeTip}
`;
  }

  const body = `
This PR was automatically generated.
Merge changes from [en.javascript.info](https://github.com/${config.org}/${config.langMain}.${config.repoSuffix}/commits/master) at ${shortHash}

${conflictList}

${tips}
`;

  try {

    debug("Look for sync PRs");

    let existingPrs = await octokitBot.search.issuesAndPullRequests({
      q: `type:pr Sync with upstream in:title is:open author:${config.botUser} repo:${config.org}/${langInfo.code}.${config.repoSuffix}`
    });

    for(let existingPr of existingPrs.data.items) {
      debug("Delete PR " + existingPr.number);

      await octokitBot.pulls.update({
        owner: config.org,
        repo: `${langInfo.code}.${config.repoSuffix}`,
        pull_number: existingPr.number,
        state: 'closed'
      });
    }

    debug("Create sync PR");

    const { data: {number: pull_number} } = await octokitBot.pulls.create({
      owner: config.org,
      repo:  `${langInfo.code}.${config.repoSuffix}`,
      title,
      body,
      head:  syncBranch,
      base:  'master',
    });

    // adding reviewers doesn't work, error:
    // Could not add requested reviewers to pull request.
    /*
    await octokitBot.pulls.createReviewRequest({
      owner: config.org,
      repo: `${langInfo.code}.${config.repoSuffix}`,
      pull_number,
      reviewers: [langInfo.maintainers[0]]
    });*/

  } catch(err) {
    if (err.name === 'HttpError') {
      console.error(err.errors);
    }
    throw err;
  }

};

