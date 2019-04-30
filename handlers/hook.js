const crypto = require('crypto');
const config = require('../config');
const debug = require('debug')('handlers:hook');
const Octokit = require('@octokit/rest');
const _ = require('lodash');
const octokit = new Octokit({
  auth:     `token ${config.secret.github.token}`,
  //log: console,
  previews: ['hellcat-preview', 'mercy-preview'], // enables nested teams API
});
// chinese bot: https://github.com/fanyijihua/robot

async function removeLabel(labels, params) {
  return await octokit.issues.removeLabel({
    owner:        config.org,
    ...params
  });
}

async function addLabels(params) {
  return await octokit.issues.removeLabel({
    owner:        config.org,
    ...params
  });
}

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


  // koa-bodyparser gives that
  debug(ctx.request.rawBody);

  signature = signature.replace(/^sha1=/, '');
  let computedSignature = crypto
    .createHmac('sha1', Buffer.from(config.secret.github.hook, 'utf-8'))
    .update(ctx.request.rawBody)
    .digest('hex');

  debug("Hook data", event, ctx.request.body);

  debug("Compare signature", computedSignature, signature);

  if (computedSignature !== signature) {
    ctx.throw(400, 'X-Hub-Signature does not match blob signature');
  }

  let action = ctx.request.body.action;

  // new pr
  if (event === 'pull_request' && action === 'opened') {
    await onPullOpen(ctx.request.body);
  }

  // changes requested
  if (event === 'pull_request_review' && action === 'submitted') {
    await onPullRequestReviewSubmit(ctx.request.body);
  }

  // /done
  if (event === 'issue_comment' && action === 'created') {
    await onIssueComment(ctx.request.body);
  }

  ctx.body = '';

};

async function onIssueComment({issue, repository, comment}) {
  debug("Comment to Issue");

  if (!issue.pull_request) {
    return; // comment to issue, not to PR?
  }

  debug("Comment to PR");

  let labels = _.keyBy(issue.labels, 'name');

  if (comment.body.trim() === '/done') {
    await removeLabel({
      repo:         repository.name,
      issue_number: issue.number,
      name:         'changes requested',
    });

    await addLabels({
      repo:   repository.name,
      issue_number: issue.number,
      labels: ['review needed'],
    });
  }
}

async function onPullOpen({repository, number}) {
  debug("PR open");

  await addLabels({
    repo:   repository.name,
    issue_number: number,
    labels: ['review needed'],
  });
}

async function onPullRequestReviewSubmit({repository, review, pull_request: {number, labels}}) {

  debug("PR request submitted", review.state, number);

  labels = _.keyBy(labels, 'name');

  if (review.state === "changes_requested") {
    await removeLabel({
      repo:         repository.name,
      issue_number: number,
      name:         'review needed',
    });

    await addLabels({
      repo:   repository.name,
      issue_number: number,
      labels: ['changes requested'],
    });
  }

  if (review.state === "approved") {
    await removeLabel({
      repo:         repository.name,
      issue_number: number,
      name:         'changes requested',
    });

    debug("Labels", labels);

    if (!labels['need +1']) {
      await removeLabel({
        repo:         repository.name,
        issue_number: number,
        name:         'review needed'
      });
      await addLabels({
        repo:   repository.name,
        issue_number: number,
        labels: ['need +1'],
      });
    } else {
      // maybe just merge on 2nd approval, so this never happens
      await removeLabel({
        repo:         repository.name,
        issue_number: number,
        name:         'need +1'
      });
      await addLabels({
        repo:   repository.name,
        issue_number: number,
        labels: ['ready to merge']
      });
    }
  }

}


/**
 1) каждый PR помечается review needed
 2) когда ревьювер request changes, PR помечается changes requested
 3) когда чел вносит изменения, он пишет /done, и PR помечается review needed
 4) когда изменения приняты (changes approved) PR помечается +1 review needed
 5) то же самое еще раз для второго review (edited)
 */
