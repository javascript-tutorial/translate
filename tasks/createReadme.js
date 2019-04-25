
const config = require("../config");
const createReadme = require('../lib/init/createReadme');

module.exports = async () => {

  let args = require('yargs')
    .demand('lang')
    .argv;

  let langInfo = require('../langs/' + args.lang);

  if (!langInfo) {
    throw new Error("No such language");
  }

  await createReadme(langInfo);

};
