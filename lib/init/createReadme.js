const config = require("../../config");
const debug = require('debug')('init:createReadme');
const Octokit = require('@octokit/rest');
const path = require('path');
const fs = require('mz/fs');
const run = require('../run');
const ejs = require('ejs');
const updateRepo = require('../updateRepo');

const octokit = new Octokit({
  auth:     `token ${config.secret.github.token}`,
  previews: ['hellcat-preview'], // enables nested teams API
});


// if original local repo doesn't exist => create it
// if translated local repo exists => we're done
//   otherwise
//     if translated remote repo exists => clone it, set upstream
//     otherwise create translated local and remote repos
module.exports = async function(langInfo) {

  let translatedPath = path.join(config.repoRoot, `${langInfo.code}.${config.repoSuffix}`);
  let existsTranslated = await fs.exists(translatedPath);

  if (!existsTranslated) {
    console.error("No translated local repo");
    process.exit(1);
  }

  debug("Local translated repo exists: " + existsTranslated);

  let template = ejs.compile(fs.readFileSync(path.join(__dirname, 'Readme.template.md'), 'utf-8'), {escape: str => str});

  let text = template({langInfo});

  await updateRepo(langInfo.code);

  let readmePath = path.join(translatedPath, 'README.md');
  fs.writeFileSync(readmePath, text);

  await run(`git commit -m readme README.md`, {cwd: translatedPath});

  await run(`git push origin master`, {cwd: translatedPath});

};
