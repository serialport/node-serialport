# Node Serialport
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![codecov](https://codecov.io/gh/node-serialport/node-serialport/branch/master/graph/badge.svg)](https://codecov.io/gh/node-serialport/node-serialport)
[![Build Status](https://travis-ci.org/node-serialport/node-serialport.svg?branch=master)](https://travis-ci.org/node-serialport/node-serialport)
[![Build status](https://ci.appveyor.com/api/projects/status/u6xe3iao2crd7akn/branch/master?svg=true)](https://ci.appveyor.com/project/serialport/node-serialport/branch/master)
[![Greenkeeper badge](https://badges.greenkeeper.io/node-serialport/node-serialport.svg)](https://greenkeeper.io/)

Working with serial ports can be hard, this is a collection of projects that make it easier.

> Go to https://serialport.io/ to learn more.

## Quick Answers to Important Questions
- [**Guides**](https://serialport.io/docs/guide-about)
- [**API Docs**](https://serialport.io/docs/api-overview)

Chances are you're looking for the [`serialport`](https://serialport.io/docs/api-serialport.md) package which provides a good set of defaults for most projects. However it is quite easy to mix and match the parts of serialport you need.

## Bindings
The Bindings provide a low level interface to work with your serialport. It is possible to use them alone but it's usually easier to use them with an interface.
- [`@serialport/bindings`](https://serialport.io/docs/api-bindings) bindings for Linux, Mac and Windows
- [`@serialport/binding-abstract`](https://serialport.io/docs/api-bindings-abstract) as an abstract class to use if you're making your own bindings
- [`@serialport/binding-mock`](https://serialport.io/docs/api-binding-mock) for a mock binding package for testing

## Interfaces
Interfaces take a binding object and provide a different API on top of it. Currently we only ship a Node Stream Interface.

- [`@serialport/stream`](https://serialport.io/docs/api-stream) our traditional Node.js Stream interface

## Parsers

Parsers are used to take raw binary data and transform them into usable messages. This may include tasks such as converting the data to text, emitting useful chunks of data when they have been fully received, or even validating protocols.

Parsers are traditionally Transform streams, but Duplex streams and other non stream interfaces are acceptable.

- [@serialport/parser-byte-length](https://serialport.io/docs/api-parser-byte-length)
- [@serialport/parser-cctalk](https://serialport.io/docs/api-parser-cctalk)
- [@serialport/parser-delimiter](https://serialport.io/docs/api-parser-delimiter)
- [@serialport/parser-readline](https://serialport.io/docs/api-parser-readline)
- [@serialport/parser-ready](https://serialport.io/docs/api-parser-ready)
- [@serialport/parser-regex](https://serialport.io/docs/api-parser-regex)
- [@serialport/parser-slip-encoder](https://serialport.io/docs/api-parser-slip-encoder)

### Developing node serialport projects
1. Clone this repo `git clone git@github.com:node-serialport/node-serialport.git`
1. Run `npm install` to setup local package dependencies (run this any time you depend on a package local to this repo)
1. Run `npm test` to ensure everything is working properly
1. Run `npm run generate` to generate a new project
1. Add dev dependencies to the root package.json and package dependencies to the package's one.

### Developing Docs

You can develop the docs by running

```bash
npm run docs:dev
```

And build them by running
```bash
npm run docs
```

Docs are automatically built with [netlify](https://www.netlify.com/pricing/) including previews on branches. The master branch is deployed to https://serialport.io

## License
SerialPort packages are all [MIT licensed](LICENSE) and all it's dependencies are MIT or BSD licensed.

## Code of Conduct
SerialPort follows the [Nodebots Code of Conduct](http://nodebots.io/conduct.html).

### TLDR
- Be respectful.
- Abusive behavior is never tolerated.
- Data published to NodeBots is hosted at the discretion of the service administrators, and may be removed.
- Don't build evil robots.
- Violations of this code may result in swift and permanent expulsion from the NodeBots community.
