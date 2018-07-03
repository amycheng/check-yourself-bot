Check Yourself Bot
===================
a GitHub app that gently notifies you of failed builds in CircleCI.

## Requirements
- that your repo uses the CircleCI for continuous integration
- a [CircleAPI key](https://circleci.com/account/api)
- ... that is defined as `token: [KEY]` in `.github/token.yml`

**WARNING**
If your repo is public, this key will be visible! Users with this key can start and cancel builds, and add users to your CircleCI SSH permissions. There can be potential for abuse. You can also host your own instance of this bot and set this key in a `.env` file. If you're using a `.env` file, set the token as: `CIRCLECI=[KEY]`

## Approach
This GitHub app listens to opened pull request events and status events. CircleCI uses the Status api to provide build information for each commit. When a PR is opened, this app fetches all statuses associated with that PR and looks for the latest failed CircleCI. If there's a failed build, this app will post a comment in the PR.

Sometimes the PR will have a pending build when it's opened. Listening to status events, ensures that when a failed build finishes, the app will post a comment in the relevant PR.

## Challenges
The payloads from GitHub webhooks and REST endpoints, and CircleCI endpoints contain a wealth of information but the response from a single event or endpoint did not provide information about which CI build referred to which pull request.

For example, the payload for the `pull_request.opened` event will not have information about associated statuses and the payload for the `status` event will not have information about which PR the commit belongs to.

In order to define the relationship between a PR and a CircleCI build (if there is one), one or two additional calls to a different API is needed.

For example, using information provied by the pull request webhook, a call was made to the Status API. Then using the information provided by that response, a call to the CircleCI API is needed to get build information.

If we have data about a status (from the `Status` event payload), then a call to the Search API (to find if the status/commit is part of a PR) and a call to the CircleCI API are needed.

Also, things like the commit SHA, output messages, tended be nested in the JSON responses, sometimes 2 levels deep (this led to slightly messy destructuring). The CircleCI API returned the relevant information in a single object, which was the only item in an array, that in turn was nested in another object. There really isn't a simple way to remedy this besides a very throurough reading of the prettified API response :-/
