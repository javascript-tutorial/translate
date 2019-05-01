const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');

const config = {
  projectRoot: process.cwd(),
  cacheRoot: path.join(process.cwd(), 'cache'),
  backupRoot: path.join(process.cwd(), 'backup'),
  repoRoot: path.join(process.cwd(), 'repo'),
  secret: require('/js/secret/translate'),
  owner: "iliakan",
  org: "javascript-tutorial",
  botUser: "javascript-translate-bot",
  repoSuffix: "javascript.info",
  langMain: "en",
  teamMain: "translate",
  labels: _.keyBy([{
    name: "needs +1",
    color: '3b22e2',
  }, {
    name: "review needed",
    color: 'b72d32'
  }, {
    name: "changes requested",
    color: '82ffdf'
  }, {
    name: 'ready to merge',
    color: '006400'
  }], 'name')
};

fs.ensureDirSync(config.cacheRoot);
fs.ensureDirSync(config.backupRoot);
fs.ensureDirSync(config.repoRoot);

config.langs = {};
for(let file of fs.readdirSync(path.join(__dirname, 'langs'))) {
  let lang = require(path.join(__dirname, 'langs', file));
  config.langs[lang.code] = lang;
}

module.exports = config;
