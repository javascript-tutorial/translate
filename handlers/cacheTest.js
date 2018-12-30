
const config = require("../config");


exports.get = async function(ctx) {

  ctx.type = 'image/svg+xml';
  ctx.set('cache-control', 'no-cache');

  ctx.body = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="20">
    <text x="0" y="20" color="red">${new Date()}%</text>
    </svg>`;

};
