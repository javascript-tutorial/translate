
const config = require("../config");
const fse = require('fs-extra');

fse.removeSync(config.repoRoot);
fse.mkdirsSync(config.repoRoot);
