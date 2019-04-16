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

  set(langCode, stats) {
    this.stats[langCode] = stats;
    this.write();
  }

  get(langCode) {
    return this.stats[langCode];
  }

  static instance() {
    if (!this._instance) {
      this._instance = new Stats();
      this._instance.stats = fs.existsSync(statsPath) ? parseJsonToPlainObjects(fs.readFileSync(statsPath)) : {};
    }
    return this._instance;
  }

  async gather(langCode) {

    debug("Gather stats", langCode);

    let rootOriginal = path.join(config.repoRoot, `${config.langMain}.${config.repoSuffix}`);
    let rootTranslated = path.join(config.repoRoot, `${langCode}.${config.repoSuffix}`);

    debug("Local repos", rootOriginal, rootTranslated);

    let translation = await countTranslation(rootOriginal, rootTranslated);

    // debug("Translation stats", translation);

    debug("gather contributors stats", rootOriginal);

    let contributors = (this.get(langCode) ? this.get(langCode).contributors : {}) || {};

    await countAuthors(langCode, contributors);

    let repo = await request({
      url:     `https://api.github.com/repos/${config.org}/${langCode}.${config.repoSuffix}`,
      headers: {
        'User-Agent':    'javascript.info',
        'Accept':        'application/vnd.github.v3+json',
        'Authorization': `token ${config.secret.github.token}`
      },
      json:    true
    });

    this.set(langCode, {translation, contributors, repo});


  }



  write() {
    fs.writeFileSync(statsPath, JSON.stringify(this.stats));
  }
};
