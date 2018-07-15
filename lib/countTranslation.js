'use strict';

const glob = require('glob');
const config = require('../config');
const debug = require('debug')('countTranslation');
const path = require('path');
const fs = require('fs');
const jsdiff = require('diff');

module.exports = async function(rootEn, rootLang) {

  debug(`Compare ${rootEn} vs ${rootLang}`);

  let filesFrom = glob.sync('**/*.md', {cwd: rootEn}).filter(f => parseInt(f));

  debug("filesFrom", filesFrom);

  let filesTranslated = 0;
  let filesMissing = 0;
  let filesSimilar = 0;

  for (let relPath of filesFrom) {
    let fileFrom = path.join(rootEn, relPath);
    let fileLang = path.join(rootLang, relPath);

    debug(relPath);
    if (!fs.existsSync(fileLang)) {
      filesMissing++;
      debug("MISSING");
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
    // debug(fileFromContent);

    let linesTotal = (fileFromContent.match(/\n+/g) || []).length;

    let diff = jsdiff.diffLines(fileFromContent, fileLangContent);


    let added = 0;
    let removed = 0;
    for (let obj of diff) {
      if (obj.added) added += obj.count;
      if (obj.removed) removed += obj.count;
    }

    if (added + removed > linesTotal / 3) {
      debug("TRANSLATED", added, removed, linesTotal);
      filesTranslated++;
    } else {
      debug("SIMILAR", added, removed, linesTotal);
      filesSimilar++;
    }

    // debug("RESULT", added, removed, linesTotal);
    //return;
    // if (added == 0 && removed == 0)
    //debug("RESULT", added, removed, linesTotal);

  }

  let result = {filesTranslated, filesMissing, filesSimilar, filesTotal: filesFrom.length};
  debug("TOTAL", result);

  return result;
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

