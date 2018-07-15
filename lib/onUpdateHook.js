
const config = require("../config");
const path = require("path");
const countTranslation = require("./countTranslation");
const exec = require('mz/child_process').exec;
const debug = require('debug')('onUpdateRepo');
const fs = require('fs');

module.exports = async function(githubHookInfo) {
  let repoDir = path.join(config.repoRoot, githubHookInfo.repository.name);

  if (!fs.existsSync(repoDir)) {
    await run(`git clone --depth 1 "${githubHookInfo.repository.clone_url}" "${repoDir}"`);
  }

  await run(`git fetch origin`, {cwd: repoDir});

  await run(`git checkout -f origin/master`, {cwd: repoDir});

  let repoConfig = config.secret.repos[githubHookInfo.repository.full_name];

  if (repoConfig.lang == 'en') {
    // don't count translation for en, just update local copy
    return;
  }

  let rootEn = path.join(config.repoRoot, 'javascript-tutorial-en');
  let rootLang = path.join(config.repoRoot, githubHookInfo.repository.name);

  let stats = await countTranslation(rootEn, rootLang);

  let

  console.log(compare);
};


async function run(cmd, options = {}) {
  if (!options.encoding) {
    options.encoding = 'utf-8';
  }

  debug(cmd);
  let result = await exec(cmd, options);
  debug(result);

  return result;
}