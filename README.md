# @serialport/bindings-cpp

[![Backers on Open Collective](https://opencollective.com/serialport/backers/badge.svg)](#backers)
[![Sponsors on Open Collective](https://opencollective.com/serialport/sponsors/badge.svg)](#sponsors)
[![codecov](https://codecov.io/gh/serialport/bindings-cpp/branch/main/graph/badge.svg?token=rsGeOmdnsV)](https://codecov.io/gh/serialport/bindings-cpp)
[![Test / Lint](https://github.com/serialport/bindings-cpp/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/serialport/bindings-cpp/actions/workflows/test.yml)

Access serial ports with JavaScript. Linux, OSX and Windows. Welcome your robotic JavaScript overlords. Better yet, program them!

> Go to https://serialport.io/ to learn more, find guides and api documentation.

## Quick Links

- 📚 [**Guides**](https://serialport.io/docs/)
- [**API Docs**](https://serialport.io/docs/api-serialport)
- [`@serialport/bindings-cpp`](https://www.npmjs.com/package/@serialport/bindings-cpp)
- 🐛 [Help and Bugs](https://github.com/serialport/node-serialport/issues/new/choose) All serialport issues are pointed to the main serialport repo.

### Bindings

The Bindings provide a low level interface to work with your serialport. It is possible to use them alone but it's usually easier to use them with an interface.

- [`@serialport/bindings`](https://serialport.io/docs/api-bindings) bindings for Linux, Mac and Windows
- [`@serialport/binding-interface`](https://serialport.io/docs/api-bindings-interface) as an interface to use if you're making your own bindings
- [`@serialport/binding-mock`](https://serialport.io/docs/api-binding-mock) for a mock binding package for testing

## Developing

### Developing node serialport projects

1. Clone this repo `git clone git@github.com:serialport/bindings-cpp.git`
1. Run `npm install` to setup local package dependencies (run this any time you depend on a package local to this repo)
1. Run `npm test` to ensure everything is working properly
1. If you have a serial loopback device (TX to RX) you can run run `TEST_PORT=/path/to/port npm test` for a more comprehensive test suite. (Defaults to 115200 baud customize with the TEST_BAUD env.) You can use an arduino with the `test/arduino-echo` sketch.

### Developing Docs

See https://github.com/serialport/website

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

### Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/serialport/node-serialport/graphs/contributors"><img src="https://opencollective.com/serialport/contributors.svg?width=890&button=false" /></a>

### Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/serialport#backer)]

<a href="https://opencollective.com/serialport#backers" target="_blank"><img src="https://opencollective.com/serialport/backers.svg?width=890"></a>

### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/serialport#sponsor)]

<!-- <a href="https://opencollective.com/serialport/sponsor/0/website" target="_blank"><img src="https://opencollective.com/serialport/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/serialport/sponsor/1/website" target="_blank"><img src="https://opencollective.com/serialport/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/serialport/sponsor/2/website" target="_blank"><img src="https://opencollective.com/serialport/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/serialport/sponsor/3/website" target="_blank"><img src="https://opencollective.com/serialport/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/serialport/sponsor/4/website" target="_blank"><img src="https://opencollective.com/serialport/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/serialport/sponsor/5/website" target="_blank"><img src="https://opencollective.com/serialport/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/serialport/sponsor/6/website" target="_blank"><img src="https://opencollective.com/serialport/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/serialport/sponsor/7/website" target="_blank"><img src="https://opencollective.com/serialport/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/serialport/sponsor/8/website" target="_blank"><img src="https://opencollective.com/serialport/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/serialport/sponsor/9/website" target="_blank"><img src="https://opencollective.com/serialport/sponsor/9/avatar.svg"></a> -->
