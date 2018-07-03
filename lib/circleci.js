require('dotenv').config();

const axios = require('axios'),
  yaml = require('js-yaml'),
  parseUrl = require('url'),
  stripAnsi = require('strip-ansi');

/**
 * get names and output urls of failed build tasks
 *
 * @param {string} token - CircleCI token needed to use the CircleCI api
 * @param {string} buildUrl - url for the CircleCI build, goes to the app GUI
 * @param {object} repoInfo - the repo we want to know more about
 * @param {string} repoInfo.repoName
 * @param {string} repoInfo.repoOwner
 * @return {array}
 */
function getBuildInfo (token, buildUrl, {name: repoName, owner: repoOwner}) {
  const parsedPaths = parseUrl.parse(buildUrl).pathname.split('/'),
    buildNumber = parsedPaths[parsedPaths.length-1],
    buildInfoUrl = `https://circleci.com/api/v1.1/project/github/${repoOwner}/${repoName}/${buildNumber}?circle-token=${token}`;

  return axios.get(buildInfoUrl)
    .then((res) => {
      // get any build tasks that have failed
      let failedBuildTasks = res.data.steps.filter((step)=>{
        const action = step.actions[0];

        return action.failed;
      });

      // throw away information that we're not using
      failedBuildTasks = failedBuildTasks.map((task)=>{
        return {taskName: task.name, outputUrl: task.actions[0].output_url};
      });

      return failedBuildTasks;
    });
}

/**
 * get the command line message associated with the output of a build task, strip
 * message of ANSI characters
 *
 * @param {string} outputUrl - CircleCI api endpoint for the build task output
 * @return {string}
 */
function getBuildOutputMessage (outputUrl) {
  return axios.get(outputUrl)
    .then((res) => {
      return stripAnsi(res.data[0].message);
    });
}

/**
 * get CircleCI token from either a settings.yaml in the repo or the app's
 * env file
 *
 * @param {object} githubApi - interface to the GitHub REST API, provided by Probot
 * @param {object} repoInfo - url for the CircleCI build, goes to the app GUI
 * @param {string} repoInfo.repoName
 * @param {string} repoInfo.repoOwner
 * @param {string} repoInfo.ref
 * @return {string}
 */
async function token (githubApi, {name: repoName, owner: repoOwner, commit: ref}) {
  let tokenFile,
    tokenFileContents,
    token;

  try {
    tokenFile = await githubApi.repos.getContent({
      owner: repoOwner,
      ref: ref,
      repo: repoName,
      path: '.github/token.yml'
    });

    tokenFileContents = await axios.get(tokenFile.data.download_url).then((res)=>res.data);

    token = yaml.safeLoad(tokenFileContents).token;

  } catch(e) {
    token = process.env.CIRCLECI;
  }
  return token;
}


module.exports.getBuildInfo = getBuildInfo;
module.exports.getBuildOutputMessage = getBuildOutputMessage;
module.exports.token = token;
