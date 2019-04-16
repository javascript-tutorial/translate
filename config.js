const path = require('path');

const config = {
  projectRoot: process.cwd(),
  cacheRoot: path.join(process.cwd(), 'cache'),
  repoRoot: path.join(process.cwd(), 'repo'),
  secret: require('/js/secret/translate'),
  owner: "iliakan",
  org: "javascript-tutorial",
  repoSuffix: "javascript.info",
  langMain: "en",
  teamMain: "translate"
};

module.exports = config;
