
const config = require("../../config");
const debug = require('debug')('init:createTeam');
const Octokit = require('@octokit/rest');
const path = require('path');
const fs = require('mz/fs');
const run = require('../run');

const octokit = new Octokit({
  auth: `token ${config.secret.github.token}`,
  previews: ['hellcat-preview'], // enables nested teams API
});


const graphql = require('@octokit/graphql').defaults({
  headers: {
    authorization: `token ${config.secret.github.token}`,
    accept:        'application/vnd.github.elektra-preview+json'
  }
});


// if original local repo doesn't exist => create it
// if translated local repo exists => we're done
//   otherwise
//     if translated remote repo exists => clone it, set upstream
//     otherwise create translated local and remote repos
module.exports = async function(langInfo) {
  debug("Getting parent team id");

  const {data: parentTeam} = await octokit.teams.getByName({
    org: config.org,
    team_slug: config.teamMain
  });

  debug("Got parent team", parentTeam && parentTeam.id);

  debug("Getting translate team id");

  let translateTeam;
  try {
    translateTeam = await octokit.teams.getByName({
      org:       config.org,
      team_slug: `${config.teamMain}-${langInfo.code}`
    });
    translateTeam = translateTeam.data;

  } catch(e) {
    if (e.status === 404) {
      /* ok, no such team */
    } else {
      throw e;
    }
  }

  if (translateTeam) {
    debug("Got translate team", translateTeam.id);
  } else {
    debug("No translate team, creating");

    // No graphql to create team
    const response = await octokit.teams.create({
      org: config.org,
      name: `${config.teamMain}-${langInfo.code}`,
      description: `Discuss the translation of Javascript Tutorial into ${langInfo.name}.`,
      privacy: 'closed',
      parent_team_id: parentTeam.id,
    });
    // console.log(response);
    translateTeam = response.data;

    debug("Created translate team", translateTeam);
  }

  debug("Allow team to admin repo");

  await octokit.teams.addOrUpdateRepo({
    team_id: translateTeam.id,
    owner: config.org,
    repo: `${langInfo.code}.${config.repoSuffix}`,
    permission: 'admin'
  });

  debug("Adding maintainers");

  for(let maintainer of langInfo.maintainers) {
    await octokit.teams.addOrUpdateMembership({
      team_id: translateTeam.id,
      username: maintainer,
      role: 'maintainer'
    });
  }

};


async function findTeamNodeIdBySlug(slug) {
  const {organization: {team}} = await graphql(`
    query($org: String!, $teamSlug: String!) {
      organization(login:$org) {
        team(slug:$teamSlug) {
          id
        } 
      }
    }`, {
    org: config.org,
    teamSlug: slug
  });

  return team && team.id;
}
