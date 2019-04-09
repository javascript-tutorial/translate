const run = require('./run');
const assert = require('assert');
const debug = require('debug')('lib/countFileAuthorStats');

function escapeShell(cmd) {
  return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
}

async function countFileAuthorStats(repoPath, filePath) {
  let stdout = await run('git blame -w --porcelain '+ escapeShell(filePath), {
    cwd: repoPath
  });

  // don't trim! last line may be empty source line
  let lines = stdout.split(/\n/);

  /*
  Each commit is porcelain:
    hash [line at the moment of commit] [line now] [number of modified subsequent lines in current blame group]
    headerName headerValue
    ...
    TAB sourceLine

  if commit is repeated, only hash, no headers
   */

  let commits = {};

  for (let i = 0; i < lines.length - 1; i++) { // last line of output is always \n

    debug(lines.length, i, lines[i]);

    let [hash, /*sourceLine*/, /*originalLine*/, /*linesCount*/] = lines[i].split(' ');

    debug(hash, "exists", commits[hash]);

    if (!commits[hash]) {
      i++;
      let authorEmail, authorName;

      while(lines[i][0] !== '\t') { // source line starts prefixed by tab
        if (lines[i].startsWith('author-mail ')) {
          authorEmail = lines[i].slice('author-mail <'.length, -1);
        }

        if (lines[i].startsWith('author ')) {
          authorName = lines[i].slice('author '.length);
        }
        i++;
      }

      let sourceLine = lines[i].slice(1).trim();

      debug(authorEmail, sourceLine, Boolean(sourceLine), '<-- first time');


      // must save commit info even for empty lines
      // next lines from same commit may be non-empty, but there will be no commit info
      commits[hash] = {
        linesCount: sourceLine ? 1 : 0, // ignore blank lines
        authorEmail,
        authorName
      };

    } else {
      i++;
      let sourceLine = lines[i].trim();
      debug(lines[i], Boolean(sourceLine), '<-- seen this');
      if (!sourceLine) continue; // ignore blank lines

      commits[hash].linesCount++;
    }

    assert(commits[hash].authorEmail);
    assert(commits[hash].authorName);

    // some commits may have no lines yet
  }


  let fileStats = Object.create(null);
  let authorEmailToName = Object.create(null);

  for (let hash in commits) {
    let commit = commits[hash];
    if (!commit.linesCount) continue; // ignore commit with blank lines only
    authorEmailToName[commit.authorEmail] = commit.authorName;
    fileStats[commit.authorEmail] = (fileStats[commit.authorEmail] || 0) + commit.linesCount;
  }

  debug(fileStats);

  return {fileStats, authorEmailToName};
}

module.exports = countFileAuthorStats;

countFileAuthorStats('/js/javascript-tutorial-zh', '4-frames-and-windows/01-popup-windows/article.md');
