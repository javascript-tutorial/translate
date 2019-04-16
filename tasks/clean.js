
const config = require("../config");
const fse = require('fs-extra');

module.exports = async () => {
  fse.removeSync(config.repoRoot);
  fse.mkdirsSync(config.repoRoot);
};
