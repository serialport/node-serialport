# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [10.0.1](https://github.com/serialport/node-serialport/compare/v10.0.0...v10.0.1) (2021-12-25)


### Bug Fixes

* Parity option broken in bindings ([#2377](https://github.com/serialport/node-serialport/issues/2377)) ([07a71f2](https://github.com/serialport/node-serialport/commit/07a71f2552b91ab6c895bccf73bd7357f9928977))





# [10.0.0](https://github.com/serialport/node-serialport/compare/v9.2.8...v10.0.0) (2021-12-11)


### Features

* Node-API migration ([#2305](https://github.com/serialport/node-serialport/issues/2305)) ([2fe7d43](https://github.com/serialport/node-serialport/commit/2fe7d434ca087f95a09ed9a3274d8b5f24e09ab4))


### BREAKING CHANGES

* This release switches to NAPI which changes how many binaries are released and will potentially break your build system





## [9.2.8](https://github.com/serialport/node-serialport/compare/v9.2.7...v9.2.8) (2021-11-26)


### Bug Fixes

* drop node 17 builds ([#2356](https://github.com/serialport/node-serialport/issues/2356)) ([e2ad9fb](https://github.com/serialport/node-serialport/commit/e2ad9fb380f4fc587a6782c7cee5d335bad4aa2d))
* Electron 14+ installs ([#2360](https://github.com/serialport/node-serialport/issues/2360)) ([9997085](https://github.com/serialport/node-serialport/commit/99970852c7a5189067fdc4d893029727d2385a47))
* OSX List Make sure necessary cleanups such as uv_mutex_unlock are called always. ([#2343](https://github.com/serialport/node-serialport/issues/2343)) ([fc93cb6](https://github.com/serialport/node-serialport/commit/fc93cb6af83358f1104fc842e65ccda9b8320904))





## [9.2.7](https://github.com/serialport/node-serialport/compare/v9.2.5...v9.2.7) (2021-11-18)

**Note:** Version bump only for package @serialport/bindings





## [9.2.6](https://github.com/serialport/node-serialport/compare/v9.2.5...v9.2.6) (2021-11-18)

**Note:** Version bump only for package @serialport/bindings





## [9.2.5](https://github.com/serialport/node-serialport/compare/v9.2.4...v9.2.5) (2021-10-31)

**Note:** Version bump only for package @serialport/bindings





## [9.2.4](https://github.com/serialport/node-serialport/compare/v9.2.3...v9.2.4) (2021-09-28)

**Note:** Version bump only for package @serialport/bindings





## [9.2.3](https://github.com/serialport/node-serialport/compare/v9.2.1...v9.2.3) (2021-09-24)

**Note:** Version bump only for package @serialport/bindings





## [9.2.2](https://github.com/serialport/node-serialport/compare/v9.2.1...v9.2.2) (2021-09-24)

**Note:** Version bump only for package @serialport/bindings





## [9.2.1](https://github.com/serialport/node-serialport/compare/v9.2.0...v9.2.1) (2021-09-03)

**Note:** Version bump only for package @serialport/bindings





# [9.2.0](https://github.com/serialport/node-serialport/compare/v9.1.0...v9.2.0) (2021-06-19)

**Note:** Version bump only for package @serialport/bindings





# [9.1.0](https://github.com/serialport/node-serialport/compare/v9.0.8...v9.1.0) (2021-05-28)


### Bug Fixes

* linux baudRate and latency errors ([#2253](https://github.com/serialport/node-serialport/issues/2253)) ([015bc17](https://github.com/serialport/node-serialport/commit/015bc17996721c92746e44e797b1a3d899076af1))
* Linux low latency allow seting without changing low latency mode ([#2241](https://github.com/serialport/node-serialport/issues/2241)) ([fb53b99](https://github.com/serialport/node-serialport/commit/fb53b99d4ab63bf0b50409a2f9e0c7c29715699b))





## [9.0.8](https://github.com/serialport/node-serialport/compare/v9.0.9...v9.0.8) (2021-05-24)


### Bug Fixes

* electron 11 prebuilds were broken ([#2237](https://github.com/serialport/node-serialport/issues/2237)) ([ac25b3a](https://github.com/serialport/node-serialport/commit/ac25b3ad5393f8c398824c46c411509b91fb3755))





## [9.0.7](https://github.com/serialport/node-serialport/compare/v9.0.6...v9.0.7) (2021-02-22)

**Note:** Version bump only for package @serialport/bindings





## [9.0.4](https://github.com/serialport/node-serialport/compare/v9.0.3...v9.0.4) (2020-12-17)

**Note:** Version bump only for package @serialport/bindings





## [9.0.3](https://github.com/serialport/node-serialport/compare/v9.0.2...v9.0.3) (2020-12-04)

**Note:** Version bump only for package @serialport/bindings





## [9.0.2](https://github.com/serialport/node-serialport/compare/v9.0.1...v9.0.2) (2020-10-16)

**Note:** Version bump only for package @serialport/bindings





## [9.0.1](https://github.com/serialport/node-serialport/compare/v9.0.0...v9.0.1) (2020-08-08)


### Bug Fixes

* disconnects should now work again on unix based systems ([#2120](https://github.com/serialport/node-serialport/issues/2120)) ([2801301](https://github.com/serialport/node-serialport/commit/2801301d1467152753c2012c7968947cf7f49c82))





# [9.0.0](https://github.com/serialport/node-serialport/compare/v8.0.8...v9.0.0) (2020-05-10)


### chore

* build on node 14 and drop node 8 and 32bit linux builds ([#2079](https://github.com/serialport/node-serialport/issues/2079)) ([e0c232c](https://github.com/serialport/node-serialport/commit/e0c232c77ade7ab188dade1dc0cc7af134ce3a95))


### BREAKING CHANGES

* Dropping node 8 and 32bit linux builds





## [8.0.8](https://github.com/serialport/node-serialport/compare/v8.0.7...v8.0.8) (2020-05-07)


### Bug Fixes

* reject on non-zero exit codes ([#2046](https://github.com/serialport/node-serialport/issues/2046)) ([6ee5c84](https://github.com/serialport/node-serialport/commit/6ee5c8471fd1e041ebfba736f1eb708d2764b63e))





## [8.0.7](https://github.com/serialport/node-serialport/compare/v8.0.6...v8.0.7) (2020-01-30)

**Note:** Version bump only for package @serialport/bindings





## [8.0.6](https://github.com/serialport/node-serialport/compare/v8.0.5...v8.0.6) (2019-12-25)


### Bug Fixes

* bindings.close() should cause a canceled read error ([#1972](https://github.com/serialport/node-serialport/issues/1972)) ([50f967e](https://github.com/serialport/node-serialport/commit/50f967e788f362da57d782829712542c8f15f8c8))
* No prebuilt binaries found with electron-builder ([#2003](https://github.com/serialport/node-serialport/issues/2003)) ([16f9662](https://github.com/serialport/node-serialport/commit/16f966233930bc7c7302d2b7a53d70282b42e165))
