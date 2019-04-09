const config = require("../config");
const fs = require('fs');
const path = require("path");
const debug = require("debug")('lib:stats');
const countTranslation = require("./countTranslation");
const countAuthors = require("./countAuthors");
const request = require('request-promise');

let statsPath = path.join(config.cacheRoot, 'stats.json');
let {parseJsonToPlainObjects} = require('./util');


module.exports = class Stats {

  set(name, stats) {
    this.stats[name] = stats;
    this.write();
  }

  get(name) {
    return this.stats[name];
  }

  static instance() {
    if (!this._instance) {
      this._instance = new Stats();
      this._instance.stats = fs.existsSync(statsPath) ? parseJsonToPlainObjects(fs.readFileSync(statsPath)) : {};
    }
    return this._instance;
  }

  async gather(repoName) {

    let rootEn = path.join(config.repoRoot, 'javascript-tutorial-en');
    let rootLang = path.join(config.repoRoot, path.basename(repoName));

    debug("translation", rootEn, rootLang);

    let translation = await countTranslation(rootEn, rootLang);

    debug(translation);

    debug("contributors", rootLang);

    let contributors = (this.get(repoName) ? this.get(repoName).contributors : {}) || {};
    await countAuthors(repoName, contributors);

    let repo = await request({
      url:     'https://api.github.com/repos/' + repoName,
      headers: {
        'User-Agent':    'javascript.info',
        'Accept':        'application/vnd.github.v3+json',
        'Authorization': `token ${config.secret.github.token}`
      },
      json:    true
    });

    this.set(repoName, {translation, contributors, repo});
  }


  write() {
    fs.writeFileSync(statsPath, JSON.stringify(this.stats));
  }
};
