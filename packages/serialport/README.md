# SerialPort

Access serial ports with JavaScript. Linux, OSX and Windows. Welcome your robotic JavaScript overlords. Better yet, program them!

> Go to https://serialport.io/ to learn more, find guides and api documentation.

## Quick Links
- [**Guides**](https://serialport.io/docs/guide-about)
- [**API Docs**](https://serialport.io/docs/api-serialport)
- [The `serialport` package api docs](https://serialport.io/docs/api-serialport)


### Serialport
- [`serialport`](https://serialport.io/docs/api-serialport) Chances are you're looking for the `serialport` package which provides a good set of defaults for most projects. However it is quite easy to mix and match the parts of serialport you need.

### Bindings
The Bindings provide a low level interface to work with your serialport. It is possible to use them alone but it's usually easier to use them with an interface.
- [`@serialport/bindings`](https://serialport.io/docs/api-bindings) bindings for Linux, Mac and Windows
- [`@serialport/binding-abstract`](https://serialport.io/docs/api-bindings-abstract) as an abstract class to use if you're making your own bindings
- [`@serialport/binding-mock`](https://serialport.io/docs/api-binding-mock) for a mock binding package for testing

### Interfaces
Interfaces take a binding object and provide a different API on top of it. Currently we only ship a Node Stream Interface.

- [`@serialport/stream`](https://serialport.io/docs/api-stream) our traditional Node.js Stream interface

### Parsers

Parsers are used to take raw binary data and transform them into usable messages. This may include tasks such as converting the data to text, emitting useful chunks of data when they have been fully received, or even validating protocols.

Parsers are traditionally Transform streams, but Duplex streams and other non stream interfaces are acceptable.

- [@serialport/parser-byte-length](https://serialport.io/docs/api-parser-byte-length)
- [@serialport/parser-cctalk](https://serialport.io/docs/api-parser-cctalk)
- [@serialport/parser-delimiter](https://serialport.io/docs/api-parser-delimiter)
- [@serialport/parser-readline](https://serialport.io/docs/api-parser-readline)
- [@serialport/parser-ready](https://serialport.io/docs/api-parser-ready)
- [@serialport/parser-regex](https://serialport.io/docs/api-parser-regex)
- [@serialport/parser-slip-encoder](https://serialport.io/docs/api-parser-slip-encoder)

## Developing

### Developing node serialport projects
1. Clone this repo `git clone git@github.com:serialport/node-serialport.git`
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
SerialPort packages are all [MIT licensed](LICENSE) and all it's dependencies are MIT licensed.

## Code of Conduct
SerialPort follows the [Nodebots Code of Conduct](http://nodebots.io/conduct.html). While the code is MIT licensed participation in the community has some rules to make this a good place to work and learn.

### TLDR
- Be respectful.
- Abusive behavior is never tolerated.
- Data published to NodeBots is hosted at the discretion of the service administrators, and may be removed.
- Don't build evil robots.
- Violations of this code may result in swift and permanent expulsion from the NodeBots community.

## Governance and Community

SerialPort is currently employees a [governance](https://medium.com/the-node-js-collection/healthy-open-source-967fa8be7951) with a group of maintainers, committers and contributors, all fixing bugs and adding features and improving documentation. You need not apply to work on SerialPort, all are welcome to join, build, and maintain this project.

- A Contributor is any individual creating or commenting on an issue or pull request. By participating, this is you.
- Committers are contributors who have been given write access to the repository. They can review and merge pull requests.
- Maintainers are committers representing the required technical expertise to resolve rare disputes.

If you have a PR that improves the project people in any or all of the above people will help you land it.

**Maintainers**

- [Francis Gulotta](https://twitter.com/reconbot) | [reconbot](https://github.com/reconbot)
- [Nick Hehr](https://twitter.com/hipsterbrown) | [hipsterbrown](https://github.com/hipsterbrown)
