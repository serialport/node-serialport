# Node Serialport
[![npm](https://img.shields.io/npm/dm/serialport.svg?maxAge=2592000)](http://npmjs.com/package/serialport)
[![Gitter chat](https://badges.gitter.im/EmergingTechnologyAdvisors/node-serialport.svg)](https://gitter.im/EmergingTechnologyAdvisors/node-serialport)
[![Known Vulnerabilities](https://snyk.io/test/github/node-serialport/node-serialport/badge.svg)](https://snyk.io/test/github/node-serialport/node-serialport)
[![codecov](https://codecov.io/gh/node-serialport/node-serialport/branch/master/graph/badge.svg)](https://codecov.io/gh/node-serialport/node-serialport)
[![Build Status](https://travis-ci.org/node-serialport/node-serialport.svg?branch=master)](https://travis-ci.org/node-serialport/node-serialport)
[![Build status](https://ci.appveyor.com/api/projects/status/u6xe3iao2crd7akn/branch/master?svg=true)](https://ci.appveyor.com/project/serialport/node-serialport/branch/master)
[![Greenkeeper badge](https://badges.greenkeeper.io/node-serialport/node-serialport.svg)](https://greenkeeper.io/)

Working with serialports can be hard, this is a collection of projects that make it easier. We currently have the following packages.

- Serialport `serialport` the only package you need to get started.
- Serialport Stream `@serialport/stream` our traditional stream interface with nothing else
- Parser Byte Length
- Parser cctalk
- Parser delimiter
- Parser readline
- Parser ready
- Parser regex
- Parser slip-encoder
- Abstract Binding `@serialport/binding-abstract` as an abstract class for all bindings
- Mock Binding `@serialport/binding-mock` for a mock binding package

## Quick Answers to Important Questions
- [**API Docs**](https://node-serialport.github.io/node-serialport/)

## Intro to Node-Serialport

Imagine a world where you can write JavaScript to control blenders, lights, security systems, or even robots. That's right—robots! Thanks to Node Serialport, that world is here.

Node-Serialport provides an interface for the low-level serial port code necessary to control [Arduino](http://www.arduino.cc/) chipsets, X10 interfaces, [Zigbee](http://www.zigbee.org/) radios, highway signs, lcd screens, cash drawers, motor controllers, sensor packages, fork lifts, modems, drones, CNC machines, plotters, vending machines, ccTalk coin accecptors, SMS Gateways, RFID scanners and much more. If you have a hardware device with a [UART](https://en.wikipedia.org/wiki/Universal_asynchronous_receiver/transmitter) we can speak to it. The physical world is your oyster with this goodie.

For a full breakdown of why we made Node-Serialport, please read [NodeBots - The Rise of JS Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics). It explains why one would want to program robots in JS in the first place. It's not being against firmware but we can be better than it.

### Developing node serialport projects
1. Clone this repo `git clone git@github.com:node-serialport/node-serialport.git`
1. Run `npx lerna bootstrap` to setup local package dependencies (run this any time you depend on a package local to this repo)
1. Run `npm test` to ensure everything is working properly
1. Run `npm run generate` to generate a new project

## API Documentation

- [**API Docs**](https://node-serialport.github.io/node-serialport/)

You can generate the docs by running

```bash
npm run docs
```

And browsing to `./docs/index.html`.

## License
SerialPort Utilities are all [MIT licensed](LICENSE) and all it's dependencies are MIT or BSD licensed.
