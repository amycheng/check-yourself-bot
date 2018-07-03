'use strict';

const circle = require('./circleci');

/**
 * generate a message in Markdown about a failed build task
 *
 * @param {string} buildTaskName
 * @param {string} buildMessage
 * @return {string}
 */
function generateIssueBody(buildTaskName, buildMessage) {
  const string = `
  ## ${buildTaskName} didn't finish.

  \`\`\`
  ${buildMessage}
  \`\`\`

  `;

  return string;
}
/**
 * generate a GitHub issue body about failed build tasks
 *
 * @param {string} circleToken
 * @param {string} buildUrl - url for the CircleCI build, goes to the app GUI
 * @param {object} repoInfo - contains name and owner the repo we want to know more about
 * @return {string}
 */
async function createIssue(circleToken, buildUrl, repoInfo) {
  const buildOutputInfo = await circle.getBuildInfo(circleToken, buildUrl, repoInfo);
  let issueBody = `# [Build Failed](${buildUrl})!`;

  for (let output of buildOutputInfo) {
    const outputMesssage = await circle.getBuildOutputMessage(output.outputUrl),
      taskOutput = generateIssueBody(output.taskName, outputMesssage);

    issueBody = issueBody + taskOutput;
  }

  return issueBody;
}

module.exports.createIssue = createIssue;
module.exports.generateIssueBody = generateIssueBody;
