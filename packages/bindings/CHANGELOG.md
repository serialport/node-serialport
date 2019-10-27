# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [8.0.4](https://github.com/serialport/node-serialport/compare/v8.0.3...v8.0.4) (2019-10-27)


### Bug Fixes

* learn now needs the package-lock.json files ([4b8fc24](https://github.com/serialport/node-serialport/commit/4b8fc248778b69f7afde17ab9ef791ef8867c4a5))
* npmignore should ignore .DS_Store files ([#1954](https://github.com/serialport/node-serialport/issues/1954)) ([eb6b57b](https://github.com/serialport/node-serialport/commit/eb6b57bffe33c9bc7775bb6b0fdf1081db86ebcc))





## [8.0.3](https://github.com/serialport/node-serialport/compare/v8.0.2...v8.0.3) (2019-10-03)


### Bug Fixes

* Add missing asyncClose ([#1946](https://github.com/serialport/node-serialport/issues/1946)) ([4a3d2a0](https://github.com/serialport/node-serialport/commit/4a3d2a0)), closes [#1904](https://github.com/serialport/node-serialport/issues/1904)
* enabling disabled tests rename all pkgs to lib ([#1941](https://github.com/serialport/node-serialport/issues/1941)) ([b1cc840](https://github.com/serialport/node-serialport/commit/b1cc840))
* unix reading ([#1953](https://github.com/serialport/node-serialport/issues/1953)) ([c7ca08f](https://github.com/serialport/node-serialport/commit/c7ca08f))





## [8.0.2](https://github.com/serialport/node-serialport/compare/v8.0.1...v8.0.2) (2019-09-24)


### Bug Fixes

* stop polling if the poller has an error ([#1936](https://github.com/serialport/node-serialport/issues/1936)) ([c57b6e9](https://github.com/serialport/node-serialport/commit/c57b6e9)), closes [#1803](https://github.com/serialport/node-serialport/issues/1803)
* we weren’t running all the tests ([#1937](https://github.com/serialport/node-serialport/issues/1937)) ([a5f7d60](https://github.com/serialport/node-serialport/commit/a5f7d60))





## [8.0.1](https://github.com/serialport/node-serialport/compare/v6.2.2...v8.0.1) (2019-09-18)


### Bug Fixes

* bindings now error when closed during empty writes ([#1872](https://github.com/serialport/node-serialport/issues/1872)) ([9d01492](https://github.com/serialport/node-serialport/commit/9d01492))
* deprecated c++ functions for update to Node v12 ([#1743](https://github.com/serialport/node-serialport/issues/1743)) ([1eecd60](https://github.com/serialport/node-serialport/commit/1eecd60))
* make node 12 work! ([00dc272](https://github.com/serialport/node-serialport/commit/00dc272))
* prebuild now pays attention to lerna tags ([#1639](https://github.com/serialport/node-serialport/issues/1639)) ([d3d553f](https://github.com/serialport/node-serialport/commit/d3d553f))
* prebuild on mojave ([#1759](https://github.com/serialport/node-serialport/issues/1759)) ([d4f5128](https://github.com/serialport/node-serialport/commit/d4f5128)), closes [/github.com/nodejs/node/pull/23685#issuecomment-430408541](https://github.com//github.com/nodejs/node/pull/23685/issues/issuecomment-430408541)
* propagate async context in callbacks ([#1765](https://github.com/serialport/node-serialport/issues/1765)) ([9b5dbdb](https://github.com/serialport/node-serialport/commit/9b5dbdb)), closes [#1751](https://github.com/serialport/node-serialport/issues/1751)
* remove PURGE_RXABORT flag on flush for Windows ([#1817](https://github.com/serialport/node-serialport/issues/1817)) ([1daa919](https://github.com/serialport/node-serialport/commit/1daa919))
* RTS/CTS flow control for Windows ([#1809](https://github.com/serialport/node-serialport/issues/1809)) ([cd112ca](https://github.com/serialport/node-serialport/commit/cd112ca))
* stream read not working past 1 read ([#1925](https://github.com/serialport/node-serialport/issues/1925)) ([3a13279](https://github.com/serialport/node-serialport/commit/3a13279))
* use correct casts to/from HANDLE/int ([#1766](https://github.com/serialport/node-serialport/issues/1766)) ([ce503b3](https://github.com/serialport/node-serialport/commit/ce503b3))
* **packages/bindings#write:** do not call native binding for empty buffers ([d347f3b](https://github.com/serialport/node-serialport/commit/d347f3b))
* writing issue on Linux ([#1908](https://github.com/serialport/node-serialport/issues/1908)) ([a7d1937](https://github.com/serialport/node-serialport/commit/a7d1937))


### chore

* remove node6 support and upgrade codebase ([#1851](https://github.com/serialport/node-serialport/issues/1851)) ([d4f15c0](https://github.com/serialport/node-serialport/commit/d4f15c0))


### Features

* add eslint mocha ([#1922](https://github.com/serialport/node-serialport/issues/1922)) ([afbc431](https://github.com/serialport/node-serialport/commit/afbc431))
* Make it possible to compile on vanilla Android ([#1912](https://github.com/serialport/node-serialport/issues/1912)) ([ba2b69c](https://github.com/serialport/node-serialport/commit/ba2b69c))
* support Exar ttyXRUSB ([#1893](https://github.com/serialport/node-serialport/issues/1893)) ([3d34d0f](https://github.com/serialport/node-serialport/commit/3d34d0f))


### BREAKING CHANGES

* flush behavior on windows no longer cancels inflight reads
* bindings now use async functions so they’ll never throw, only reject





# [3.0.0](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.8...@serialport/bindings@3.0.0) (2019-05-16)


### Bug Fixes

* remove PURGE_RXABORT flag on flush for Windows ([#1817](https://github.com/serialport/node-serialport/issues/1817)) ([1daa919](https://github.com/serialport/node-serialport/commit/1daa919))
* RTS/CTS flow control for Windows ([#1809](https://github.com/serialport/node-serialport/issues/1809)) ([cd112ca](https://github.com/serialport/node-serialport/commit/cd112ca))


### chore

* remove node6 support and upgrade codebase ([#1851](https://github.com/serialport/node-serialport/issues/1851)) ([d4f15c0](https://github.com/serialport/node-serialport/commit/d4f15c0))


### BREAKING CHANGES

* flush behavior on windows no longer cancels inflight reads
* bindings now use async functions so they’ll never throw, only reject





## [2.0.8](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.7...@serialport/bindings@2.0.8) (2019-04-27)


### Bug Fixes

* make node 12 work! ([00dc272](https://github.com/serialport/node-serialport/commit/00dc272))





## [2.0.7](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.6...@serialport/bindings@2.0.7) (2019-01-24)

**Note:** Version bump only for package @serialport/bindings





## [2.0.6](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.5...@serialport/bindings@2.0.6) (2019-01-12)

### Bug Fixes

* fix crash at port open ([#1772](https://github.com/serialport/node-serialport/issues/1772)) ([415891c](https://github.com/serialport/node-serialport/commit/415891c))


## [2.0.5](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.4...@serialport/bindings@2.0.5) (2019-01-08)


### Bug Fixes

* prebuild on mojave ([#1759](https://github.com/serialport/node-serialport/issues/1759)) ([d4f5128](https://github.com/serialport/node-serialport/commit/d4f5128)), closes [/github.com/nodejs/node/pull/23685#issuecomment-430408541](https://github.com//github.com/nodejs/node/pull/23685/issues/issuecomment-430408541)
* propagate async context in callbacks ([#1765](https://github.com/serialport/node-serialport/issues/1765)) ([9b5dbdb](https://github.com/serialport/node-serialport/commit/9b5dbdb)), closes [#1751](https://github.com/serialport/node-serialport/issues/1751)
* use correct casts to/from HANDLE/int ([#1766](https://github.com/serialport/node-serialport/issues/1766)) ([ce503b3](https://github.com/serialport/node-serialport/commit/ce503b3))





## [2.0.4](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.3...@serialport/bindings@2.0.4) (2018-12-19)


### Bug Fixes

* deprecated c++ functions for update to Node v12 ([#1743](https://github.com/serialport/node-serialport/issues/1743)) ([1eecd60](https://github.com/serialport/node-serialport/commit/1eecd60))





## [2.0.3](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.2...@serialport/bindings@2.0.3) (2018-11-27)


### Bug Fixes

* **packages/bindings#write:** do not call native binding for empty buffers ([d347f3b](https://github.com/serialport/node-serialport/commit/d347f3b))





<a name="2.0.2"></a>
## [2.0.2](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.1...@serialport/bindings@2.0.2) (2018-08-29)

**Note:** Version bump only for package @serialport/bindings





<a name="2.0.1"></a>
## [2.0.1](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.0...@serialport/bindings@2.0.1) (2018-08-29)


### Bug Fixes

* prebuild now pays attention to lerna tags ([#1639](https://github.com/serialport/node-serialport/issues/1639)) ([d3d553f](https://github.com/serialport/node-serialport/commit/d3d553f))





<a name="2.0.0"></a>
# 2.0.0 (2018-08-26)

**Note:** Version bump only for package @serialport/bindings
