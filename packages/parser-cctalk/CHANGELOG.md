# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [8.0.4](https://github.com/serialport/node-serialport/compare/v8.0.3...v8.0.4) (2019-10-27)


### Bug Fixes

* npmignore should ignore .DS_Store files ([#1954](https://github.com/serialport/node-serialport/issues/1954)) ([eb6b57b](https://github.com/serialport/node-serialport/commit/eb6b57bffe33c9bc7775bb6b0fdf1081db86ebcc))





## [8.0.3](https://github.com/serialport/node-serialport/compare/v8.0.2...v8.0.3) (2019-10-03)


### Bug Fixes

* enabling disabled tests rename all pkgs to lib ([#1941](https://github.com/serialport/node-serialport/issues/1941)) ([b1cc840](https://github.com/serialport/node-serialport/commit/b1cc840))





## [8.0.1](https://github.com/serialport/node-serialport/compare/v6.2.2...v8.0.1) (2019-09-18)


### chore

* remove node6 support and upgrade codebase ([#1851](https://github.com/serialport/node-serialport/issues/1851)) ([d4f15c0](https://github.com/serialport/node-serialport/commit/d4f15c0))


### Features

* Added packet timeout for cctalk parser ([#1887](https://github.com/serialport/node-serialport/issues/1887)) ([714e438](https://github.com/serialport/node-serialport/commit/714e438))


### BREAKING CHANGES

* bindings now use async functions so they’ll never throw, only reject





# [4.0.0](https://github.com/serialport/node-serialport/compare/@serialport/parser-cctalk@2.0.2...@serialport/parser-cctalk@4.0.0) (2019-08-05)

### implementing packet byte timeouts due to cctalk documentation

* Added timeout parameter to constructor
* Implemented the reset of packet receiving process after timeout ([#1886])

# [3.0.0](https://github.com/serialport/node-serialport/compare/@serialport/parser-cctalk@2.0.2...@serialport/parser-cctalk@3.0.0) (2019-05-16)


### chore

* remove node6 support and upgrade codebase ([#1851](https://github.com/serialport/node-serialport/issues/1851)) ([d4f15c0](https://github.com/serialport/node-serialport/commit/d4f15c0))


### BREAKING CHANGES

* bindings now use async functions so they’ll never throw, only reject





## [2.0.2](https://github.com/serialport/node-serialport/compare/@serialport/parser-cctalk@2.0.1...@serialport/parser-cctalk@2.0.2) (2018-11-27)

**Note:** Version bump only for package @serialport/parser-cctalk





<a name="2.0.1"></a>
## [2.0.1](https://github.com/serialport/node-serialport/compare/@serialport/parser-cctalk@2.0.0...@serialport/parser-cctalk@2.0.1) (2018-08-29)

**Note:** Version bump only for package @serialport/parser-cctalk





<a name="2.0.0"></a>
# 2.0.0 (2018-08-26)

**Note:** Version bump only for package @serialport/parser-cctalk
