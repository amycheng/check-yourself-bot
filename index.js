'use strict';
const circle = require('./lib/circleci'),
  utils = require('./lib/utils');

module.exports = (bot) => {
  bot.on('pull_request.opened', async (context) => {
    const {
        head: prInfo,
        number: issueNumber} = context.payload.pull_request,
      {
        sha: ref,
        repo: {name: repoName},
        repo: {owner: {login: repoOwner}}} = prInfo,
      // CircleCI uses the Status API, so we want to get the pull request's
      // statuses to see if any builds have failed
      status = await context.github.repos.getStatuses({owner:repoOwner, repo: repoName, ref:ref}),
      // only look at statuses that were created by CircleCI
      latestCI = status.data.find((item)=>{
        return item.context==='ci/circleci';
      }),
      repoInfo = {
        commit: ref,
        name: repoName,
        owner: repoOwner
      };

    let issueBody;

    // only post a pull request comment if the CircleCI build failed
    if (latestCI.state === 'failure') {
      issueBody = await utils.createIssue(await circle.token(context.github, repoInfo), latestCI.target_url, repoInfo);

      context.github.issues.createComment({
        owner:repoOwner,
        repo: repoName,
        number: issueNumber,
        body: issueBody});
    }
  });

  // listening for status events because CircleCI uses the Status API and
  // and sometimes builds are still pending when the pull_request.event is
  // triggered. Also, when new commits are pushed, CircleCI will do another
  // build and trigger another status event
  bot.on('status', async (context) => {
    const {
        sha: sha,
        repository: {name: repoName},
        repository: {owner: {login: repoOwner}},
        target_url: buildUrl} = context.payload,
      repoInfo = {
        commit: sha,
        name: repoName,
        owner: repoOwner
      };

    let issueBody, issueNumber, results;
    // check if the status is associated with a failed CircleCI build
    if (context.payload.state === 'failure' && context.payload.context === 'ci/circleci') {
      // assumes that since we're using a unique SHA, that there will only be
      // 1 result. we also just want a status that is associated with a pull
      // request
      results = await context.github.search.issues({q:sha});

      if (results.data.items.length>0) {
        issueBody = await utils.createIssue(await circle.token(context.github, repoInfo), buildUrl, repoInfo);
        issueNumber = results.data.items[0].number;

        context.github.issues.createComment({
          owner: repoOwner,
          repo: repoName,
          number: issueNumber,
          body: issueBody
        });
      }
    }
  });
};
