const request = require('request-promise');
const config = require("../../config");
const findProgressIssue = require('../findProgressIssue');
const debug = require('debug')('init:createProgressIssue');
const Octokit = require('@octokit/rest');

const graphql = require('@octokit/graphql').defaults({
  headers: {
    authorization: `token ${config.secret.github.token}`,
    accept:        'application/vnd.github.elektra-preview+json'
  }
});

const octokit = new Octokit({
  auth: `token ${config.secret.github.token}`
});


module.exports = async function(langInfo) {
  let issueExists = await findProgressIssue(langInfo);

  if (issueExists) {
    return;
  }

  let body = await getText(langInfo.maintainers);

/*
  await octokit.issues.create({
    owner: 'iliakan',
    repo: `${langInfo.code}.${config.repoSuffix}`,
    title: `${langInfo.name} Translation Progress`,
    body
  });
*/
/*
  let result = await graphql(`
    mutation($body: String!, $title: String!, $repositoryId:ID!) {
      createIssue(input: {
        body: $body
        title: $title
        repositoryId: $repositoryId
      })
    }
  `, {
    title: "Title Title",
    body: "Body Body",
    repositoryId: 123
  });*/

  debug("Getting repo id");

  const {repositoryOwner: {repository}} = await graphql(`query($owner: String!, $name: String!) {
    repositoryOwner(login:$owner) {
      repository(name:$name) {
        id
      } 
    }
  }`, {
    owner: config.org,
    name: `${langInfo.code}.${config.repoSuffix}`
  });

  debug("Creating issue");

  // https://github.com/MichaelJCompton/GraphSchemaTools/wiki/Example-Mutations-and-Queries
  // https://developer.github.com/v4/guides/forming-calls/#about-mutations
  let result = await graphql(`
    mutation($input: CreateIssueInput!) {
      createIssue(input: $input) {
        issue {
          id
        }
      }
    }
  `, {
    input: {
      title: `${langInfo.name} Translation Progress`,
      body,
      repositoryId: repository.id
    }
  });

  debug('Created issue to track translation progress.');

};

async function checkIssueExists(langCode) {

  debug("Looking for progress issue");

  // https://help.github.com/en/articles/understanding-the-search-syntax
  // https://help.github.com/en/articles/searching-issues-and-pull-requests
  const {search: {nodes}} = await graphql(`
      query {
        search(
          type: ISSUE
          query: "repo:${config.org}/${langCode}.${config.repoSuffix} Translation Progress in:title is:open"
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


  debug("Found issues: " + nodes.length)
  return nodes.length > 0;
}

// https://github.com/tesseralis/is-react-translated-yet/blob/master/src/LangList.js
async function getText(maintainers) {

  let tree = await request('https://javascript.info/tutorial/tree', {
    json: true
  });

  let text = `
## Maintainer List

${maintainers.map(maintainer => `@${maintainer}`).join(', ')}

## For New Translators

To translate a page:

1. Check that no one else has claimed your page in the checklist and comments below.
2. Comment below with the name of the page you would like to translate. **Please take only one page at a time**.
3. Clone this repo, translate your page, and submit a pull request!

Before contributing, read the glossary and style guide (once they exist) to understand how to translate various technical and React-specific terms.

Please be prompt with your translations! If you find find that you can't commit any more, let the maintainers know so they can assign the page to someone else.

## For Maintainers

When someone volunteers, edit this issue with the username of the volunteer, and with the PR. Ex:

* [ ] Home Page (@iliakan) #1

When PRs are merged, make sure to mark that page as completed!
`;


  for (let root of tree.roots) {
    let section = tree.bySlugMap[root];

    text += `\n## ${section.title}\n\n`;

    for (let entrySlug of section.children) {
      let entry = tree.bySlugMap[entrySlug];

      if (entry.isFolder) {

        text += `\n### ${entry.title}\n\n`;

        for (let slug of entry.children) {
          text += `* [ ] ${tree.bySlugMap[slug].title}\n`;
        }
      } else {
        text += `* [ ] ${tree.bySlugMap[entrySlug].title}\n`;
      }
    }
  }

  return text;
}
