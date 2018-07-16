
const config = require("../config");
const fs = require('fs');
const path = require("path");
const debug = require("debug")('lib:stats');
const countTranslation = require("./countTranslation");

let statsPath = path.join(config.cacheRoot, 'stats.json');

module.exports = class Stats {

  set(name, stats) {
    this.stats[name] = stats;
    this.write();
  }

  get(name, stats) {
    return this.stats[name];
  }

  static read() {
    let stats = new Stats();
    stats.stats = fs.existsSync(statsPath) ? JSON.parse(fs.readFileSync(statsPath)) : {};
    return stats;
  }

  static instance() {
    if (!this._instance) {
      this._instance = Stats.read();
    }
    return this._instance;
  }

  async count(repoName) {

    let rootEn = path.join(config.repoRoot, 'javascript-tutorial-en');
    let rootLang = path.join(config.repoRoot, path.basename(repoName));

    let translationStats = await countTranslation(rootEn, rootLang);

    debug(translationStats);

    this.set(repoName, translationStats);

  }

  write() {
    fs.writeFileSync(statsPath, JSON.stringify(this.stats));
  }
};