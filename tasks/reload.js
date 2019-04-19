const run = require('../lib/run');

module.exports = async function () {

  await run('pm2 reload all');

};
