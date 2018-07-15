const path = require('path');

const config = {
  projectRoot: process.cwd(),
  repoRoot: path.join(process.cwd(), 'repo'),
  secret: require('/js/secret.javascript-tutorial-translate-hook')
};

module.exports = config;