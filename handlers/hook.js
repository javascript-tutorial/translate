const crypto = require('crypto');
const config = require('../config');
const debug = require('debug')('handlers:hook');
const updateRepo = require('../lib/updateRepo');

exports.post = async function(ctx) {

  let signature = ctx.get('x-hub-signature');
  let event = ctx.get('x-github-event');
  let id = ctx.get('x-github-delivery');

  if (!signature) {
    ctx.throw(400, 'No X-Hub-Signature found on request');
  }

  if (!event) {
    ctx.throw(400, 'No X-Github-Event found on request');
  }

  if (!id) {
    ctx.throw(400, 'No X-Github-Delivery found on request');
  }

  //debug("github hook", ctx.request);

  debug("Hook data", ctx.request.body);

  let repo = config.secret.repos[ctx.request.body.repository.full_name];
  if (!repo.lang) {
    // __proto__ as repo name
    this.throw(400);
  }

  // koa-bodyparser gives that
  debug(ctx.request.rawBody);

  signature = signature.replace(/^sha1=/, '');
  let computedSignature = crypto
    .createHmac('sha1', Buffer.from(repo.githubSecret, 'utf-8'))
    .update(ctx.request.rawBody)
    .digest('hex');

  debug("Compare signature", computedSignature, signature);

  if (computedSignature !== signature) {
    ctx.throw(400, 'X-Hub-Signature does not match blob signature');
  }

  if (ctx.request.body.ref !== 'refs/heads/master') {
    // ignore non-master pushes
    ctx.body = {ok: true};
    return;
  }


  ctx.body = {ok: true};

  // don't wait for it! (async)
  await updateRepo(ctx.request.body.repository.name);

  await Stats.instance().count(ctx.request.body.repository.name);

};