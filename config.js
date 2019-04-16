const path = require('path');
const fs = require('fs');

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

config.langs = {};
for(let file of fs.readdirSync(path.join(__dirname, 'langs'))) {
  let lang = require(path.join(__dirname, 'langs', file));
  config.langs[lang.code] = lang;
}

module.exports = config;
