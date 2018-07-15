'use strict';

const glob = require('glob');
const config = require('config');
const path = require('path');
const fs = require('fs');
const jsdiff = require('diff');
const log = require('log')();

module.exports = function () {

  return function () {
    let args = require('yargs')
      .demand(['lang'])
      .argv;

    return async function () {

      let root = path.dirname(config.tutorialRoot);
      let rootEn = path.join(root, 'javascript-tutorial-en');
      let rootLang = path.join(root, 'javascript-tutorial-' + args.lang);

      log.debug(`Compare ${rootEn} vs ${rootLang}`);
      let filesFrom = glob.sync('**/*.md', {cwd: rootEn}).filter(f => parseInt(f));

      let filesTranslated = 0;
      let filesMissing = 0;
      let filesSimilar = 0;

      for (let relPath of filesFrom) {
        let fileFrom = path.join(rootEn, relPath);
        let fileLang = path.join(rootLang, relPath);

        log.debug(relPath);
        if (!fs.existsSync(fileLang)) {
          filesMissing++;
          log.debug("MISSING");
          continue;
        }

        if (fs.statSync(fileFrom).size === 0) {
          // ignore zero files, don't count as translated
          // this way new repo translation starts with zero
          continue;
        }

        let fileFromContent = fs.readFileSync(fileFrom, {encoding: 'utf8'});
        let fileLangContent = fs.readFileSync(fileLang, {encoding: 'utf8'});

        fileFromContent = stripYamlHeader(fileFromContent);
        fileLangContent = stripYamlHeader(fileLangContent);

        fileFromContent = stripCode(fileFromContent);
        fileLangContent = stripCode(fileLangContent);

        fileFromContent = fileFromContent.trim();
        fileLangContent = fileLangContent.trim();
        // log.debug(fileFromContent);

        let linesTotal = (fileFromContent.match(/\n+/g) || []).length;

        /*

        let added = 0;
        let removed = 0;
        try {
          let cmd = `git diff --no-index --numstat --patience ${esc(fileFrom)} ${esc(fileLang)}`;
          log.debug(cmd);
          let compare = execSync(cmd, {encoding: 'utf8'});
        } catch(err) {
          if (err.status !== 1) {
            throw err;
          }
          [added, removed] = err.output[1].trim().split('\t');
        }
*/
        let diff = jsdiff.diffLines(fileFromContent, fileLangContent);


        let added = 0;
        let removed = 0;
        for(let obj of diff) {
          if (obj.added) added += obj.count;
          if (obj.removed) removed += obj.count;
        }

        if (added + removed > linesTotal / 3) {
          log.debug("TRANSLATED", added, removed, linesTotal);
          filesTranslated++;
        } else {
          log.debug("SIMILAR", added, removed, linesTotal);
          filesSimilar++;
        }

        // log.debug("RESULT", added, removed, linesTotal);
        //return;
        // if (added == 0 && removed == 0)
        //log.debug("RESULT", added, removed, linesTotal);

      }

      log.info("TOTAL", { filesTranslated, filesMissing, filesSimilar });
    }();

  };
};


function stripCode(content) {
  return content.replace(/(^|\n[ \t]*)```(js|css|html)[\s\S]+\n[ \t]*```/gim, '\n');
}

function stripYamlHeader(content) {
  let parts = content.split('\n---\n');
  if (parts.length === 1) {
    return content;
  }

  return parts.slice(1).join('\n---\n');
}

