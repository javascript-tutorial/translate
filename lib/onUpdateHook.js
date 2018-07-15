
const config = require("../config");
const path = require("path");
const git = require("nodegit");
const exec = require('mz/child_process');
const debug = require('debug')('onUpdateRepo');
const fs = require('fs');

module.exports = async function(githubHookInfo) {
  let repoDir = path.join(config.repoRoot, githubHookInfo.repository.name);

  if (!fs.existsSync(repoDir)) {
    debug("Clone " + githubHookInfo.repository.clone_url + " to " + repoDir);
    await git.Clone(githubHookInfo.repository.clone_url, repoDir);
  }

  let repo = await git.Repository.open(repoDir);

  await repo.fetch('origin');
  let head = await repo.getReferenceCommit("refs/remotes/origin/master");

  debug("hard reset to " + head);

  // 3 = hard reset
  await git.Reset.reset(repo, head, 3, {});
};


