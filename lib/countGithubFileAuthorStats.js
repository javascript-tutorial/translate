const assert = require('assert');
const debug = require('debug')('lib/countGithubFileAuthorStats');
const config = require('../config');
const {waitLimit} = require('./rateLimit');
const path = require('path');
const fs = require('mz/fs');
const graphql = require('@octokit/graphql').defaults({
  headers: {
    authorization: `token ${config.secret.github.token}`
  }
});


require('util').inspect.defaultOptions.depth = 10;

async function countGithubFileAuthorStats(repoName, fileRelPath, currentHead) {

  let [owner, repo] = repoName.split('/');

  let repoPath = path.join(config.repoRoot, repo);
  let filePath = path.join(repoPath, fileRelPath);

  let content = await fs.readFile(filePath, 'utf-8');
  let contentLines = content.split('\n');

  const {repositoryOwner, rateLimit} = await graphql(`query blame($owner: String!, $repo: String!, $currentHead: String!, $fileRelPath: String!) {
    repositoryOwner(login:$owner) {
      repository(name:$repo) {
        object(expression:$currentHead) {
          ... on Commit {
            blame(path:$fileRelPath) {
              ranges {
                startingLine,
                endingLine,
                commit {
                  author {
                    name,
                    avatarUrl,
                    email,
                    user {
                      login,
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }`, {
    owner,
    repo,
    currentHead,
    fileRelPath
  });

  await waitLimit(rateLimit);

  let ranges = repositoryOwner.repository.object.blame.ranges;
  // console.log(ranges);

  let statsByAuthor = Object.create(null);

  for (let range of ranges) {
    let linesCount = range.endingLine - range.startingLine + 1;

    // if a line is blank -- remove it from the counter
    for (let i = range.startingLine - 1; i < range.endingLine; i++) {
      if (!contentLines[i]) {
        linesCount--;
        continue;
      }
      if (!contentLines[i].trim()) {
        linesCount--;
      }
    }

    if (!linesCount) continue;

    let commit = range.commit;
    let authorEmail = commit.author.email;
    if (!statsByAuthor[authorEmail]) {
      statsByAuthor[authorEmail] = {
        author: commit.author,
        linesCount
      }
    } else {
      statsByAuthor[authorEmail].linesCount += linesCount;
    }
  }


  console.log(statsByAuthor);

  return statsByAuthor;

}

module.exports = countGithubFileAuthorStats;

//countGithubFileAuthorStats('xitu/javascript-tutorial-zh', '4-frames-and-windows/01-popup-windows/article.md', 'zh-hans');
