const config = require("../config");
const debug = require('debug')('init:findProgressIssue');

const graphql = require('@octokit/graphql').defaults({
  headers: {
    authorization: `token ${config.secret.github.token}`,
    accept:        'application/vnd.github.elektra-preview+json'
  }
});

module.exports = async function(langInfo) {

  debug("Looking for progress issue");

  // https://help.github.com/en/articles/understanding-the-search-syntax
  // https://help.github.com/en/articles/searching-issues-and-pull-requests
  const {search: {nodes}} = await graphql(`
      query {
        search(
          type: ISSUE
          query: "repo:${config.org}/${langInfo.code}.${config.repoSuffix} ${langInfo.name} Translation Progress in:title is:open"
          first: 1
        ) {
          nodes {
            ... on Issue {
              title
              body
              createdAt
              lastEditedAt
              number
              repository {
                name
              }
            }
          }
        }
      }
    `);


  return nodes[0];
};
