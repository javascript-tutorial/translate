const config = require("../config");
const debug = require('debug')('init:createThisReadme');
const Octokit = require('@octokit/rest');
const path = require('path');
const fs = require('mz/fs');
const run = require('../lib/run');
const ejs = require('ejs');

// if original local repo doesn't exist => create it
// if translated local repo exists => we're done
//   otherwise
//     if translated remote repo exists => clone it, set upstream
//     otherwise create translated local and remote repos
module.exports = async function(langInfo) {

  let template = ejs.compile(fs.readFileSync(path.join(__dirname, 'thisReadme.template.md'), 'utf-8'), {escape: str => str});

  let text = template({
    langs: config.langs
  });

  fs.writeFileSync('./Readme.md', text);

  let hasChanges = await run(`git status --porcelain`);
  
  if (hasChanges) {

    debug("Has changes, commit and push");

    await run(`git commit -m up Readme.md`);
    await run(`git push origin master`);
  }

  debug("Translate readme created");


};
