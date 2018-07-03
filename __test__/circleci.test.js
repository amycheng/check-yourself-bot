'use strict';

const axios = require('axios'),
  lib = require ('../lib/circleci'),
  circleCiApiMock = require('./fixtures').circleCiBuildFixture,
  mockToken = 'a1b2c3',
  mockBuildUrl = 'https://circleci.com/gh/amycheng/test-circle-app/11?utm_campaign=vcs-integration-link&utm_medium=referral&utm_source=github-build-link',
  mockRepoInfo = {name: 'repo', owner:'owner', commit:'c9882094832'};

jest.mock('axios');

describe('CircleCI helpers', ()=>{
  it('returns array of failed build tasks', async ()=>{
    const expectedData = [
      {
        taskName: 'alpha',
        outputUrl:'https://circleci.com/api/?output=123'
      },
      {
        taskName: 'beta',
        outputUrl: 'https://circleci.com/api/?output=456'
      }
    ];

    let testData;

    axios.get.mockResolvedValue(circleCiApiMock);
    testData =  await lib.getBuildInfo(mockToken, mockBuildUrl, mockRepoInfo);
    expect(testData).toEqual(expectedData);
  });

  it('returns a santized output message', async ()=>{
    const mockOutputUrl = 'https://circle-production-action-output.s3.amazonaws.com/0000',
      mockResponse = {
        data: [
          {message:'\u001b[31merror\u001b[39m Missing semicolon'}
        ]
      };

    axios.get.mockResolvedValue(mockResponse);
    expect(await lib.getBuildOutputMessage(mockOutputUrl)).toEqual('error Missing semicolon');

  });


  it('get CircleCI token from a YAML file', async ()=>{
    const mockApi = {
      repos: {
        getContent: function(){
          return {data: {download_url: 'https://raw.githubusercontent.com/user/repo/master/.github/token.yml'}};
        }
      }
    },
      mockResponse = {data:"token: '999999'"};

    axios.get.mockResolvedValue(mockResponse);
    expect(await lib.token(mockApi, mockRepoInfo)).toEqual('999999')

  });

  it('get CircleCI token from the .env file, if a YAML file is not available', async ()=> {
    const mockApi = {
      repos: {
        getContent: function(){
          throw new Error();
        }
      }
    };
    process.env.CIRCLECI = '888888'

    // axios.get.mockResolvedValue(mockResponse);
    expect(await lib.token(mockApi, mockRepoInfo)).toEqual('888888')
  });
});