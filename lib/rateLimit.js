
const debug = require("debug")('lib:rateLimit');

exports.waitLimit = async function(rateLimit, pointsThreshold = 20) {

  debug(rateLimit);

  if (rateLimit.remaining < pointsThreshold) {
    let timeout = new Date(rateLimit.resetAt) - Date.now();
    debug("waiting", timeout);
    await new Promise(resolve => setTimeout(resolve, timeout + 1000));
  }
};
