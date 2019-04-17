
const debug = require('debug')('run');
const execa = require('execa');

module.exports = async function(cmd, options = {}) {

  debug(cmd, options.cwd);

  let stdout;

  ({stdout} = await execa.shell(cmd, options));

  debug('<--', stdout);

  return stdout;
};

