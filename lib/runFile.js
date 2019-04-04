
const debug = require('debug')('run');
const execFile = require('mz/child_process').execFile;

module.exports = async function(cmd, args, options = {}) {
  if (!options.encoding) {
    options.encoding = 'utf-8';
  }

  if (!options.maxBuffer) {
    options.maxBuffer = 1e7;
  }

  if (!options.env) {
    options.env = process.env;
  }

  debug(cmd, options);
  let result = await execFile(cmd, args, options);
  debug(result);

  return result[0];
};

