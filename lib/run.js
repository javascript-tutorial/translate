
const debug = require('debug')('run');
const exec = require('mz/child_process').exec;

module.exports = async function run(cmd, options = {}) {
  if (!options.encoding) {
    options.encoding = 'utf-8';
  }

  debug(cmd, options);
  let result = await exec(cmd, options);
  debug(result);

  return result;
};
