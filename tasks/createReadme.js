
const config = require("../config");
const createReadme = require('../lib/init/createReadme');

module.exports = async () => {

  let args = require('yargs')
    .demand('lang')
    .argv;

  let langInfo = require('../langs/' + args.lang);

  await createReadme(langInfo);

};
