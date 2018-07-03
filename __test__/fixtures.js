'use strict';

const circleCiBuildFixture =  { data: {
    steps: [
      {
        name: 'alpha',
        actions: [{failed: true, output_url: 'https://circleci.com/api/?output=123'}]
      },
      {
        name: 'beta',
        actions: [{failed: true, output_url: 'https://circleci.com/api/?output=456'}]
      },
      {
        name: 'gamma',
        actions: [{ failed: false, output_url: 'https://circleci.com/api/?output=789'}]
      }
    ]}},
  circleCiOutputMessageFixture = {data:[{'type':'out','message':'\r\n> test-circle-app@0.0.1 lint /home/circleci/repo\r\n> eslint index.js\r\n\r\n\r\n\u001B[4m/home/circleci/repo/index.js\u001B[24m\r\n  \u001B[2m4:25\u001B[22m  \u001B[31merror\u001B[39m  Missing semicolon  \u001B[2msemi\u001B[22m\r\n\r\n\u001B[31m\u001B[1m✖ 1 problem (1 error, 0 warnings)\u001B[22m\u001B[39m\r\n\u001B[31m\u001B[1m\u001B[22m\u001B[39m\u001B[31m\u001B[1m  1 error, 0 warnings potentially fixable with the `--fix` option.'}]},
  buildOutputFixture = [
      {
        taskName: 'Lint JS',
        outputUrl: 'https://circleci.com/api/?output=123'
      },
      {
        taskName: 'Test JS',
        outputUrl: 'https://circleci.com/api/?output=456'
      },
    ];

module.exports.circleCiBuildFixture = circleCiBuildFixture;
module.exports.circleCiOutputMessageFixture  = circleCiOutputMessageFixture;
module.exports.buildOutputFixture = buildOutputFixture;
