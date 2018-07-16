const path = require('path');

const config = {
  projectRoot: process.cwd(),
  cacheRoot: path.join(process.cwd(), 'cache'),
  repoRoot: path.join(process.cwd(), 'repo'),
  secret: require('/js/secret.javascript-tutorial-translate-hook')
};

module.exports = config;