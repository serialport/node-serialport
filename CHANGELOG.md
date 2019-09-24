# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [8.0.2](https://github.com/node-serialport/node-serialport/compare/v8.0.1...v8.0.2) (2019-09-24)


### Bug Fixes

* stop polling if the poller has an error ([#1936](https://github.com/node-serialport/node-serialport/issues/1936)) ([c57b6e9](https://github.com/node-serialport/node-serialport/commit/c57b6e9)), closes [#1803](https://github.com/node-serialport/node-serialport/issues/1803)
* we weren’t running all the tests ([#1937](https://github.com/node-serialport/node-serialport/issues/1937)) ([a5f7d60](https://github.com/node-serialport/node-serialport/commit/a5f7d60))


### Features

* add optional end event for piping ([#1926](https://github.com/node-serialport/node-serialport/issues/1926)) ([275315a](https://github.com/node-serialport/node-serialport/commit/275315a))





## [8.0.1](https://github.com/node-serialport/node-serialport/compare/v6.2.2...v8.0.1) (2019-09-18)


### Bug Fixes

* Add missing `return` statement ([#1911](https://github.com/node-serialport/node-serialport/issues/1911)) ([288e6ac](https://github.com/node-serialport/node-serialport/commit/288e6ac))
* bindings now error when closed during empty writes ([#1872](https://github.com/node-serialport/node-serialport/issues/1872)) ([9d01492](https://github.com/node-serialport/node-serialport/commit/9d01492))
* conflicting website npm script name ([f6a800e](https://github.com/node-serialport/node-serialport/commit/f6a800e))
* deprecated c++ functions for update to Node v12 ([#1743](https://github.com/node-serialport/node-serialport/issues/1743)) ([1eecd60](https://github.com/node-serialport/node-serialport/commit/1eecd60))
* deps for parser-readline need upgrading ([aa7c0b2](https://github.com/node-serialport/node-serialport/commit/aa7c0b2))
* fix open colelctive link ([#1928](https://github.com/node-serialport/node-serialport/issues/1928)) ([6426214](https://github.com/node-serialport/node-serialport/commit/6426214))
* make node 12 work! ([00dc272](https://github.com/node-serialport/node-serialport/commit/00dc272))
* missing maintainer name ([a626103](https://github.com/node-serialport/node-serialport/commit/a626103))
* mocha opts ([e6742db](https://github.com/node-serialport/node-serialport/commit/e6742db))
* prebuild now pays attention to lerna tags ([#1639](https://github.com/node-serialport/node-serialport/issues/1639)) ([d3d553f](https://github.com/node-serialport/node-serialport/commit/d3d553f))
* prebuild on mojave ([#1759](https://github.com/node-serialport/node-serialport/issues/1759)) ([d4f5128](https://github.com/node-serialport/node-serialport/commit/d4f5128)), closes [/github.com/nodejs/node/pull/23685#issuecomment-430408541](https://github.com//github.com/nodejs/node/pull/23685/issues/issuecomment-430408541)
* propagate async context in callbacks ([#1765](https://github.com/node-serialport/node-serialport/issues/1765)) ([9b5dbdb](https://github.com/node-serialport/node-serialport/commit/9b5dbdb)), closes [#1751](https://github.com/node-serialport/node-serialport/issues/1751)
* readme badges and images for backers and contributors ([#1881](https://github.com/node-serialport/node-serialport/issues/1881)) ([1fd88e1](https://github.com/node-serialport/node-serialport/commit/1fd88e1))
* remove PURGE_RXABORT flag on flush for Windows ([#1817](https://github.com/node-serialport/node-serialport/issues/1817)) ([1daa919](https://github.com/node-serialport/node-serialport/commit/1daa919))
* RTS/CTS flow control for Windows ([#1809](https://github.com/node-serialport/node-serialport/issues/1809)) ([cd112ca](https://github.com/node-serialport/node-serialport/commit/cd112ca))
* **packages/bindings#write:** do not call native binding for empty buffers ([d347f3b](https://github.com/node-serialport/node-serialport/commit/d347f3b))
* stream read not working past 1 read ([#1925](https://github.com/node-serialport/node-serialport/issues/1925)) ([3a13279](https://github.com/node-serialport/node-serialport/commit/3a13279))
* use correct casts to/from HANDLE/int ([#1766](https://github.com/node-serialport/node-serialport/issues/1766)) ([ce503b3](https://github.com/node-serialport/node-serialport/commit/ce503b3))
* writing issue on Linux ([#1908](https://github.com/node-serialport/node-serialport/issues/1908)) ([a7d1937](https://github.com/node-serialport/node-serialport/commit/a7d1937))


### chore

* remove node6 support and upgrade codebase ([#1851](https://github.com/node-serialport/node-serialport/issues/1851)) ([d4f15c0](https://github.com/node-serialport/node-serialport/commit/d4f15c0))


### Features

* add eslint mocha ([#1922](https://github.com/node-serialport/node-serialport/issues/1922)) ([afbc431](https://github.com/node-serialport/node-serialport/commit/afbc431))
* Added packet timeout for cctalk parser ([#1887](https://github.com/node-serialport/node-serialport/issues/1887)) ([714e438](https://github.com/node-serialport/node-serialport/commit/714e438))
* generators for new packages ([#4](https://github.com/node-serialport/node-serialport/issues/4)) ([94ede44](https://github.com/node-serialport/node-serialport/commit/94ede44))
* inter byte timeout parser ([#1779](https://github.com/node-serialport/node-serialport/issues/1779)) ([cbb8e41](https://github.com/node-serialport/node-serialport/commit/cbb8e41))
* Make it possible to compile on vanilla Android ([#1912](https://github.com/node-serialport/node-serialport/issues/1912)) ([ba2b69c](https://github.com/node-serialport/node-serialport/commit/ba2b69c))
* move cli tools to their own packages ([#1664](https://github.com/node-serialport/node-serialport/issues/1664)) ([103498e](https://github.com/node-serialport/node-serialport/commit/103498e)), closes [#1659](https://github.com/node-serialport/node-serialport/issues/1659)
* namespace all packages in the new serialport npm org! ([b722062](https://github.com/node-serialport/node-serialport/commit/b722062))
* reset info.serialNumber when resetting mock ports ([#1899](https://github.com/node-serialport/node-serialport/issues/1899)) ([6acaac1](https://github.com/node-serialport/node-serialport/commit/6acaac1))
* support Exar ttyXRUSB ([#1893](https://github.com/node-serialport/node-serialport/issues/1893)) ([3d34d0f](https://github.com/node-serialport/node-serialport/commit/3d34d0f))
* test on node 12 ([#1846](https://github.com/node-serialport/node-serialport/issues/1846)) ([46da21f](https://github.com/node-serialport/node-serialport/commit/46da21f))
* Use GitHub actions for linting ([#1927](https://github.com/node-serialport/node-serialport/issues/1927)) ([fb05c2d](https://github.com/node-serialport/node-serialport/commit/fb05c2d))
* use lerna run! ([#1643](https://github.com/node-serialport/node-serialport/issues/1643)) ([7b37a36](https://github.com/node-serialport/node-serialport/commit/7b37a36))


### BREAKING CHANGES

* flush behavior on windows no longer cancels inflight reads
* bindings now use async functions so they’ll never throw, only reject
