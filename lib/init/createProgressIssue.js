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

  let body = await getHeader(langInfo);

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

  let progressIssue = await findProgressIssue(langInfo);


  if (true) {
  //if (!progressIssue) {
    body += await getInitialList(langInfo);
    debug("Creating issue");

    // https://github.com/MichaelJCompton/GraphSchemaTools/wiki/Example-Mutations-and-Queries
    // https://developer.github.com/v4/guides/forming-calls/#about-mutations
    await graphql(`
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
  } else {
    console.log(progressIssue);
  }



  debug('Created issue to track translation progress.');

};


// https://github.com/tesseralis/is-react-translated-yet/blob/master/src/LangList.js
async function getHeader(langInfo) {

  let text = `
## Maintainer List

${langInfo.maintainers.map(maintainer => `@${maintainer}`).join(', ')}

## For New Translators

<details><summary><b>Please read this first (click to open)</b></summary>
<p>
To translate an article:

1. Check that no one else has claimed your article in the checklist below.
2. Comment below with the title of the article that you would like to translate, e.g. \`An Introduction to JavaScript\`. 
    - **Please take only one article at a time**.
3. Fork this repo, translate the article in your fork and submit a pull request!
    - The pull request title should be same as the article, e.g. \`An Introduction to JavaScript\` (just like comment)

Please be prompt with your translations! If you find find that you can't commit any more, let the maintainers know so they can assign the page to someone else.
</p>
</details>

## For Maintainers

<details><summary><b>Click to open</b></summary>
<p>
Please let others know what you do, on community boards and chats, invite them to join. Translations become better if more people see them.

For teams we suggest that an article has 2 reviews to be merged. 

Translalions are tracked below, like this:

* [ ] [Home Page](url) (@iliakan) #1

There's a helper bot to track translations, you can read more about it at <https://github.com/javascript-tutorial/translate/edit/master/BOT.md>.

If something doesn't work right, please contact @iliakan. 

</p>
</details>

Only maintainers can check/uncheck items below. If you're not, please write in a comment what you take to translate.
`;

  return text;

}

async function getInitialList(langInfo) {
  let tree = await request('https://javascript.info/tutorial/tree', {
    json: true
  });

  let text = '';

  for (let root of tree.roots) {
    let section = tree.bySlugMap[root];

    text += `\n## ${section.title}\n\n`;

    for (let entrySlug of section.children) {
      let entry = tree.bySlugMap[entrySlug];

      if (entry.isFolder) {

        text += `\n### ${entry.title}\n\n`;

        for (let slug of entry.children) {
          let child = tree.bySlugMap[slug];
          // console.log(child);
          text += `* [ ] [${child.title}](${child.githubLink})\n`;
        }
      } else {
        let child = tree.bySlugMap[entrySlug];
        text += `* [ ] [${child.title}](${child.githubLink})\n`;
      }
    }
  }


  return text;
}
