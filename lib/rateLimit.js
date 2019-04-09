exports.waitLimit = async function(rateLimit, pointsThreshold = 10) {

  console.log(rateLimit);
  if (rateLimit.remaining < pointsThreshold) {
    let timeout = new Date(rateLimit.resetAt) - Date.now();
    await new Promise(resolve => setTimeout(resolve, timeout + 1000));
  }
};
