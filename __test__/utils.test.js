'use strict';

const circle = require('../lib/circleci'),
  mockBuildOutput = require('./fixtures').buildOutputFixture,
  mockToken = 'a1b2c3',
  mockBuildUrl = 'https://circleci.com/gh/amycheng/test-circle-app/11?utm_campaign=vcs-integration-link&utm_medium=referral&utm_source=github-build-link',
  mockRepoInfo = {name: 'repo', owner:'owner', commit:'c9882094832'},
  lib = require('../lib/utils');

jest.mock('../lib/circleci');

describe('utils for generating issues', () => {
  it('generate a string in Markdown for a failed build task', () => {
    const mockBuildTaskName = 'Lint CSS',
      mockBuildMsg  = 'Linting CSS failed. Duplicate selectors.';

    let testString = lib.generateIssueBody(mockBuildTaskName, mockBuildMsg);
    // We are not comparing strings directly because the spacing is inconsistent
    // across different the same template literals in different files. Jest is
    // sensitive to these inconsistencies.
    expect(testString.includes('## '+mockBuildTaskName)).toBeTruthy();
    // Make sure the string contains backticks
    expect(testString.includes('```')).toBeTruthy();
    expect(testString.includes(mockBuildMsg)).toBeTruthy();
  });

  it('calls the CirclCI api for relevant info when generating a GitHub issue', async () => {

    circle.getBuildInfo.mockResolvedValue(mockBuildOutput);
    circle.getBuildOutputMessage
      .mockReturnValueOnce('Build Output Message One')
      .mockReturnValueOnce('Build Output Message Two')
      .mockReturnValue('');

    await lib.createIssue(mockToken, mockBuildUrl, mockRepoInfo);

    expect(circle.getBuildInfo).toBeCalled();
    expect(circle.getBuildInfo).toBeCalledWith(mockToken, mockBuildUrl, mockRepoInfo);
    expect(circle.getBuildOutputMessage.mock.calls.length).toEqual(2);

  });
})