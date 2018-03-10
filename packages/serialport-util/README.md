# Serialport Parsers

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![Greenkeeper badge](https://badges.greenkeeper.io/node-serialport/parsers.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/node-serialport/parsers.svg?branch=master)](https://travis-ci.org/node-serialport/parsers)
[![codecov](https://codecov.io/gh/node-serialport/parsers/branch/master/graph/badge.svg)](https://codecov.io/gh/node-serialport/parsers)

Working with streams of binary data can be hard, this monorepo is a collection of projects that make it easier. We currently have the following projects.

- Parser Byte Length
- Parser cctalk
- Parser delimiter
- Parser readline
- Parser ready
- Parser regex

## API Docs
You can find the api docs in `/docs` or view them online here: https://node-serialport.github.io/parsers/

## License
SerialPort Parsers are all [MIT licensed](LICENSE) and all it's dependencies are MIT or BSD licensed.

# Contributing

Do you want to help out but don't know where to start?

There are a lot of ways to get involved and help out:
- [Reporting an issue](#reporting-issues)
- [Requesting features](#requesting-features)
- [Submitting Pullrequests](#pullrequests)
- [Writing tests](#writing-tests)
- [Writing Documentation](#writing-docs)

<a name="reporting-issues"></a>
## Reporting An Issue

SerialPort Parsers does it's [issue tracking](https://github.com/node-serialport/parsers/issues) through github. To report an issue first search the repo to make sure that it has not been reported before.  If no one has reported the bug before, create a new issue and be sure to follow the template.

<a name="requesting-features"></a>
## Requesting Features
To request a new feature be added create a [github issue](https://github.com/node-serialport/parsers/issues/new) and include:

**What feature you'd like to see:**
**Why this is important to you:** (this is here because it's interesting knowing what cool things people are working on and also could help community members make suggestions for work-arounds until the feature is built)

<a name="pullrequests"></a>
## Submitting Pull Requests
To contribute code to SerialPort Parsers, fork the project onto your github account and do your work in a branch. Before you submit the PR, make sure to rebase master into your branch so that you have the most recent changes and nothing breaks or conflicts.  Lint and test your code using `npm run lint` and `npm run test`.

You can use the generator `npm run generate` as a starting point for new streams.

All contributions must adhere to the eslint rules by maintaining the existing coding style.

If you are contributing code, it must include unit tests that fail if the working code isn't present and succeed when it is.

When contributing new features you must include documentation.

It's very important that your pull requests include all of the above in order for users to be able to use your code. Pull requests with undocumented code will not be accepted.

<a name="writing-tests"></a>
## Writing Tests

Tests are written using [mocha](https://mochajs.org/), [chai](http://chaijs.com/) and [sinon](http://sinonjs.org/).  If you are having issues making a test pass you can open a WIP or Work In Progress pr ans ask for help. Tests can be the hardest part to write when contributing code, so don't be discouraged.

<a name="writing-docs"></a>
## Writing Documentation

We are always looking to improve our docs.  If you find that any are lacking information or have wrong information, fix and submit a PR.  If you're looking for areas to start writing docs for, see the [docs](https://github.com/node-serialport/parsers/labels/docs) label in issues.

We use [jsdoc](http://usejsdoc.org/) to generate our docs. Make your changes to `README.md` or the documentation blocks in the JavaScript files and run `npm run docs` to generate new documentation in `/docs/`.

Docs should have tested and working sample code. Many people using SerialPort are learning how to work with hardware for the first time, so write for a beginner audience.
