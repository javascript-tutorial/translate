let app = require('../app');
const debug = require('debug')('server');

module.exports = async function() {
  app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0');
  return new Promise(resolve => {
    // never finishes
  });
};
