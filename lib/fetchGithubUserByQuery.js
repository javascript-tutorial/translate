const config = require('../config');
const request = require('request-promise');

// require('request-debug')(request);


// to get author name and email
// git log --format="%an %ae" | grep espoir.ka@gmail.com

module.exports = async function fetchGithubUserByQuery(query) {

  // console.log("getGithubUserByQuery", query);

  let opts = {
    url:                     'https://api.github.com/search/users',
    headers:                 {
      'User-Agent': 'javascript.info',
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${config.secret.github.token}`
    },
    resolveWithFullResponse: true,
    simple:                  false,
    json:                    true,
    qs:                      {
      q: query
    }
  };

  let response = await request(opts);

  // console.log(response.headers);

  if (response.statusCode === 403 && response.headers['x-ratelimit-remaining'] === '0') {

    let resetTime = +response.headers['x-ratelimit-reset'];
    let remainingTime = resetTime * 1000 - Date.now();
    // console.log("Remaining time", remainingTime, resetTime * 1000 - Date.now());
    await new Promise(resolve => setTimeout(resolve, remainingTime));

    return await fetchGithubUserByQuery(query);
  } else if (response.statusCode !== 200) {
    console.error(opts);
    console.error(response);
    throw new Error("Github response error " + response.statusCode + ' ' + response.body);
  }

  // console.log(response);

  return response.body.items[0];
};
