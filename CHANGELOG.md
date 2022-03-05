# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [10.4.0](https://github.com/serialport/node-serialport/compare/v10.3.0...v10.4.0) (2022-03-04)

### Features

- upgrade serialport-cpp for windows rts-mode ([#2448](https://github.com/serialport/node-serialport/issues/2448)) ([9f34f85](https://github.com/serialport/node-serialport/commit/9f34f85fc8109357190ecf115ce3099dd2dd7a69))

# [10.3.0](https://github.com/serialport/node-serialport/compare/v10.2.2...v10.3.0) (2022-02-14)

### Bug Fixes

- improve repl ([#2425](https://github.com/serialport/node-serialport/issues/2425)) ([7538995](https://github.com/serialport/node-serialport/commit/7538995c8a9e086be20b8d12b309c41ca93e4e43))

### Features

- have terminal ask for baudRate ([#2423](https://github.com/serialport/node-serialport/issues/2423)) ([d795f20](https://github.com/serialport/node-serialport/commit/d795f205f9384cacf6bfc73712d5ddc897da2f2e))
- platform specific open options ([#2428](https://github.com/serialport/node-serialport/issues/2428)) ([b3bead4](https://github.com/serialport/node-serialport/commit/b3bead45844498a9071c2e2edbcc2baf995bece5))

## [10.2.2](https://github.com/serialport/node-serialport/compare/v10.2.1...v10.2.2) (2022-02-05)

### Bug Fixes

- run build as part of lint ([#2420](https://github.com/serialport/node-serialport/issues/2420)) ([ab3d900](https://github.com/serialport/node-serialport/commit/ab3d900e96119b9cc732b163396edc8281e1bf72))
- stopbits definition and move binding-mock ([#2419](https://github.com/serialport/node-serialport/issues/2419)) ([63ec6bb](https://github.com/serialport/node-serialport/commit/63ec6bb7d6be312bcc8d0976c9780325c9898632))

## [10.2.1](https://github.com/serialport/node-serialport/compare/v10.2.0...v10.2.1) (2022-02-03)

### Bug Fixes

- build before publish ([9be497e](https://github.com/serialport/node-serialport/commit/9be497e0f47629926f42a60b6d020185fd6b971f))

# [10.2.0](https://github.com/serialport/node-serialport/compare/v10.1.0...v10.2.0) (2022-02-03)

### Features

- Typescript everything ([#2406](https://github.com/serialport/node-serialport/issues/2406)) ([7ae6e51](https://github.com/serialport/node-serialport/commit/7ae6e51a84738da1999863a80f4ec8ce7acd953a))

# [10.1.0](https://github.com/serialport/node-serialport/compare/v10.0.2...v10.1.0) (2022-01-23)

### Bug Fixes

- lint ([d7e81a0](https://github.com/serialport/node-serialport/commit/d7e81a0f25fbed3b005759a5a67743f53ece0fb9))

### Features

- **terminal:** Add flow control mode ([#2361](https://github.com/serialport/node-serialport/issues/2361)) ([311527e](https://github.com/serialport/node-serialport/commit/311527e9c6059f2d06873d932b025b940c5cfda7))

## [10.0.2](https://github.com/serialport/node-serialport/compare/v10.0.1...v10.0.2) (2022-01-08)

### Features

- Introduce prebuildify ([#2368](https://github.com/serialport/node-serialport/issues/2368)) ([d50673f](https://github.com/serialport/node-serialport/commit/d50673fe7403093ed9a3bcea927ac0a4a83f1b07))

## [10.0.1](https://github.com/serialport/node-serialport/compare/v10.0.0...v10.0.1) (2021-12-25)

### Bug Fixes

- build binaries on every lerna release ([f400a90](https://github.com/serialport/node-serialport/commit/f400a9087069648dbb3119cb55046543b187d7c8))
- link to discussions ([1738326](https://github.com/serialport/node-serialport/commit/17383269b1809a45d02ff88c09d73ee513712dbd))
- Parity option broken in bindings ([#2377](https://github.com/serialport/node-serialport/issues/2377)) ([07a71f2](https://github.com/serialport/node-serialport/commit/07a71f2552b91ab6c895bccf73bd7357f9928977))
- tag filtering on build job ([470bf1f](https://github.com/serialport/node-serialport/commit/470bf1fecd4ac9661d1e08c0dd7aa4941a834f3d))

# [10.0.0](https://github.com/serialport/node-serialport/compare/v9.2.8...v10.0.0) (2021-12-11)

### Features

- Node-API migration ([#2305](https://github.com/serialport/node-serialport/issues/2305)) ([2fe7d43](https://github.com/serialport/node-serialport/commit/2fe7d434ca087f95a09ed9a3274d8b5f24e09ab4))

### BREAKING CHANGES

- This release switches to NAPI which changes how many binaries are released and will potentially break your build system

## [9.2.8](https://github.com/serialport/node-serialport/compare/v9.2.7...v9.2.8) (2021-11-26)

### Bug Fixes

- drop node 17 builds ([#2356](https://github.com/serialport/node-serialport/issues/2356)) ([e2ad9fb](https://github.com/serialport/node-serialport/commit/e2ad9fb380f4fc587a6782c7cee5d335bad4aa2d))
- Electron 14+ installs ([#2360](https://github.com/serialport/node-serialport/issues/2360)) ([9997085](https://github.com/serialport/node-serialport/commit/99970852c7a5189067fdc4d893029727d2385a47))
- OSX List Make sure necessary cleanups such as uv_mutex_unlock are called always. ([#2343](https://github.com/serialport/node-serialport/issues/2343)) ([fc93cb6](https://github.com/serialport/node-serialport/commit/fc93cb6af83358f1104fc842e65ccda9b8320904))

## [9.2.7](https://github.com/serialport/node-serialport/compare/v9.2.5...v9.2.7) (2021-11-18)

**Note:** Version bump only for package serialport-monorepo

## [9.2.6](https://github.com/serialport/node-serialport/compare/v9.2.5...v9.2.6) (2021-11-18)

**Note:** Version bump only for package serialport-monorepo

## [9.2.5](https://github.com/serialport/node-serialport/compare/v9.2.4...v9.2.5) (2021-10-31)

**Note:** Version bump only for package serialport-monorepo

## [9.2.4](https://github.com/serialport/node-serialport/compare/v9.2.3...v9.2.4) (2021-09-28)

**Note:** Version bump only for package serialport-monorepo

## [9.2.3](https://github.com/serialport/node-serialport/compare/v9.2.1...v9.2.3) (2021-09-24)

**Note:** Version bump only for package serialport-monorepo

## [9.2.2](https://github.com/serialport/node-serialport/compare/v9.2.1...v9.2.2) (2021-09-24)

**Note:** Version bump only for package serialport-monorepo

## [9.2.1](https://github.com/serialport/node-serialport/compare/v9.2.0...v9.2.1) (2021-09-03)

**Note:** Version bump only for package serialport-monorepo

# [9.2.0](https://github.com/serialport/node-serialport/compare/v9.1.0...v9.2.0) (2021-06-19)

### Features

- combine lint and test workflows and clean them up ([#2261](https://github.com/serialport/node-serialport/issues/2261)) ([0461285](https://github.com/serialport/node-serialport/commit/0461285f04b93034008cf6c22ac566d0a1a09571))
- Pin version numbers for all monorepo packages ([#2275](https://github.com/serialport/node-serialport/issues/2275)) ([4fbb973](https://github.com/serialport/node-serialport/commit/4fbb973e9ea7de4dd00494b9293a428ac1c3a1e2))

# [9.1.0](https://github.com/serialport/node-serialport/compare/v9.0.8...v9.1.0) (2021-05-28)

### Bug Fixes

- linux baudRate and latency errors ([#2253](https://github.com/serialport/node-serialport/issues/2253)) ([015bc17](https://github.com/serialport/node-serialport/commit/015bc17996721c92746e44e797b1a3d899076af1))
- Linux low latency allow seting without changing low latency mode ([#2241](https://github.com/serialport/node-serialport/issues/2241)) ([fb53b99](https://github.com/serialport/node-serialport/commit/fb53b99d4ab63bf0b50409a2f9e0c7c29715699b))
- parser-slip-encoder had a breaking change ([#2254](https://github.com/serialport/node-serialport/issues/2254)) ([c89b600](https://github.com/serialport/node-serialport/commit/c89b6004308ede97c10e18f1b2fb4d40041ff752))

### Features

- Add slip decoder to parser-slip-encoder ([#2196](https://github.com/serialport/node-serialport/issues/2196)) ([85297bc](https://github.com/serialport/node-serialport/commit/85297bc3d13cdc3beeee52e5badb0016ee6f24f5))

## [9.0.8](https://github.com/serialport/node-serialport/compare/v9.0.9...v9.0.8) (2021-05-24)

### Bug Fixes

- electron 11 prebuilds were broken ([#2237](https://github.com/serialport/node-serialport/issues/2237)) ([ac25b3a](https://github.com/serialport/node-serialport/commit/ac25b3ad5393f8c398824c46c411509b91fb3755))

## [9.0.7](https://github.com/serialport/node-serialport/compare/v9.0.6...v9.0.7) (2021-02-22)

**Note:** Version bump only for package serialport-monorepo

## [9.0.6](https://github.com/serialport/node-serialport/compare/v9.0.5...v9.0.6) (2021-01-20)

**Note:** Version bump only for package serialport-monorepo

## [9.0.5](https://github.com/serialport/node-serialport/compare/v9.0.4...v9.0.5) (2020-12-20)

**Note:** Version bump only for package serialport-monorepo

## [9.0.4](https://github.com/serialport/node-serialport/compare/v9.0.3...v9.0.4) (2020-12-17)

**Note:** Version bump only for package serialport-monorepo

## [9.0.3](https://github.com/serialport/node-serialport/compare/v9.0.2...v9.0.3) (2020-12-04)

**Note:** Version bump only for package serialport-monorepo

## [9.0.2](https://github.com/serialport/node-serialport/compare/v9.0.1...v9.0.2) (2020-10-16)

### Bug Fixes

- while validating for offset, check for offset's value for NaN instead length ([#2124](https://github.com/serialport/node-serialport/issues/2124)) ([4215122](https://github.com/serialport/node-serialport/commit/42151228240c5c818ac5327d6ff5c01398805564))

## [9.0.1](https://github.com/serialport/node-serialport/compare/v9.0.0...v9.0.1) (2020-08-08)

### Bug Fixes

- disconnects should now work again on unix based systems ([#2120](https://github.com/serialport/node-serialport/issues/2120)) ([2801301](https://github.com/serialport/node-serialport/commit/2801301d1467152753c2012c7968947cf7f49c82))

# [9.0.0](https://github.com/serialport/node-serialport/compare/v8.0.8...v9.0.0) (2020-05-10)

### chore

- build on node 14 and drop node 8 and 32bit linux builds ([#2079](https://github.com/serialport/node-serialport/issues/2079)) ([e0c232c](https://github.com/serialport/node-serialport/commit/e0c232c77ade7ab188dade1dc0cc7af134ce3a95))

### BREAKING CHANGES

- Dropping node 8 and 32bit linux builds

## [8.0.8](https://github.com/serialport/node-serialport/compare/v8.0.7...v8.0.8) (2020-05-07)

### Bug Fixes

- reject on non-zero exit codes ([#2046](https://github.com/serialport/node-serialport/issues/2046)) ([6ee5c84](https://github.com/serialport/node-serialport/commit/6ee5c8471fd1e041ebfba736f1eb708d2764b63e))

## [8.0.7](https://github.com/serialport/node-serialport/compare/v8.0.6...v8.0.7) (2020-01-30)

### Bug Fixes

- uncomment node shebang line in terminal package ([#2023](https://github.com/serialport/node-serialport/issues/2023)) ([2a59726](https://github.com/serialport/node-serialport/commit/2a5972684367083595cf75e489f1165d24844423))

## [8.0.6](https://github.com/serialport/node-serialport/compare/v8.0.5...v8.0.6) (2019-12-25)

### Bug Fixes

- bindings.close() should cause a canceled read error ([#1972](https://github.com/serialport/node-serialport/issues/1972)) ([50f967e](https://github.com/serialport/node-serialport/commit/50f967e788f362da57d782829712542c8f15f8c8))
- No prebuilt binaries found with electron-builder ([#2003](https://github.com/serialport/node-serialport/issues/2003)) ([16f9662](https://github.com/serialport/node-serialport/commit/16f966233930bc7c7302d2b7a53d70282b42e165))
- stream required bindings-mock as a dep ([#1970](https://github.com/serialport/node-serialport/issues/1970)) ([e978b7e](https://github.com/serialport/node-serialport/commit/e978b7eb244b87a6be2ae914965adeb1f4562935))
- upgrade npm on GitHub actions to fix bug ([#1973](https://github.com/serialport/node-serialport/issues/1973)) ([d500a5b](https://github.com/serialport/node-serialport/commit/d500a5b1ba6e6600e0a3f4486a3c496304f95c3f))

## [8.0.5](https://github.com/serialport/node-serialport/compare/v8.0.4...v8.0.5) (2019-10-27)

### Bug Fixes

- cctalk wasn’t upgraded in serialport ([3e568f7](https://github.com/serialport/node-serialport/commit/3e568f7ca4b8e1c0743b780860532e5998091b86))

## [8.0.4](https://github.com/serialport/node-serialport/compare/v8.0.3...v8.0.4) (2019-10-27)

This is the first non beta release of serialport version 8! 🎉 The biggest change in 8x is our version numbers. We now user lerna's ["fixed versioning"](https://github.com/lerna/lerna#fixedlocked-mode-default) to allow for a much easier documentation experience. This makes all our packages share a version number when they're released. Our website now has versioned docs so you can see what they looked like for the version of serialport you're using today. (Check out our [7x docs](https://deploy-preview-24--serialport.netlify.com/docs/7.x.x/guide-about) if you still need them.)

With this change we've moved a centralized changelog (this file!) and we'll be moving older release notes here. We also moved the website to it's [own repo](https://github.com/serialport/website/).

A few breaking api changes have been introduced over the 8x beta releases. You can find out more about them in the [Upgrade Guide](https://github.com/serialport/node-serialport/blob/master/UPGRADE_GUIDE.md)

We dropped node6 support and now support node12 (and we work on node 13) which allowed us to migrate to async/await. The reduced a fair bit of code and was a welcome change.

Windows got a few notable bug fixes from contributors and RTS/CTS flow control should now work as expected.

And lastly our CI system has mostly been moved to GitHub Actions, they are much much faster than our travis/appveyor combo and cheaper too (free!). We still pay for Appveyor because we still use them with travis for binary builds. When that process is migrated we should be able to drop both services completely.

This is also our first major release since starting the [serialport collective](https://opencollective.com/serialport)! Like a lot of projects we rely on volunteers, students, professionals and the backing of companies using the project for their businesses. If you find serialport helpful, [please read about why you might want to donate](https://opencollective.com/serialport#section-about) to the project and our project's goals.

Thanks to @boneskull, @BryanHunt, @hipsterbrown, @Holger-Will, @icebob, @jacobq, @jowy, @krutkay, @maxvgi, @nornagon, @podarok, @reconbot, and @warp for their help with this release!

And Thanks to our first 5 open collective backers! https://opencollective.com/serialport#backers for help with sustaining this project!

### Bug Fixes

- improve the options and output of terminal ([#1962](https://github.com/serialport/node-serialport/issues/1962)) ([4b23928](https://github.com/serialport/node-serialport/commit/4b23928cd276d60df7c13ec32084a99752b2c3c1))
- learn now needs the package-lock.json files ([4b8fc24](https://github.com/serialport/node-serialport/commit/4b8fc248778b69f7afde17ab9ef791ef8867c4a5))
- npmignore should ignore .DS_Store files ([#1954](https://github.com/serialport/node-serialport/issues/1954)) ([eb6b57b](https://github.com/serialport/node-serialport/commit/eb6b57bffe33c9bc7775bb6b0fdf1081db86ebcc))

## [8.0.3](https://github.com/serialport/node-serialport/compare/v8.0.2...v8.0.3) (2019-10-03)

### Chores

- Test merges with master ([#1952](https://github.com/serialport/node-serialport/issues/1952)) ([bfb47c7](https://github.com/serialport/node-serialport/commit/bfb47c7))

### BREAKING CHANGES

- drop callback argument on SerialPort.list() ([#1943](https://github.com/serialport/node-serialport/issues/1943)) ([145b906](https://github.com/serialport/node-serialport/commit/145b906))

## [8.0.2](https://github.com/serialport/node-serialport/compare/v8.0.1...v8.0.2) (2019-09-24)

### Bug Fixes

- stop polling if the poller has an error ([#1936](https://github.com/serialport/node-serialport/issues/1936)) ([c57b6e9](https://github.com/serialport/node-serialport/commit/c57b6e9)), closes [#1803](https://github.com/serialport/node-serialport/issues/1803)
- we weren’t running all the tests ([#1937](https://github.com/serialport/node-serialport/issues/1937)) ([a5f7d60](https://github.com/serialport/node-serialport/commit/a5f7d60))

### Features

- add optional end event for piping ([#1926](https://github.com/serialport/node-serialport/issues/1926)) ([275315a](https://github.com/serialport/node-serialport/commit/275315a))

## [8.0.1](https://github.com/serialport/node-serialport/compare/v6.2.2...v8.0.1) (2019-09-18)

### Bug Fixes

- Add missing `return` statement ([#1911](https://github.com/serialport/node-serialport/issues/1911)) ([288e6ac](https://github.com/serialport/node-serialport/commit/288e6ac))
- bindings no longer error when closed during empty writes ([#1872](https://github.com/serialport/node-serialport/issues/1872)) ([9d01492](https://github.com/serialport/node-serialport/commit/9d01492))
- fix open collective link ([#1928](https://github.com/serialport/node-serialport/issues/1928)) ([6426214](https://github.com/serialport/node-serialport/commit/6426214))
- missing maintainer name ([a626103](https://github.com/serialport/node-serialport/commit/a626103))
- readme badges and images for backers and contributors ([#1881](https://github.com/serialport/node-serialport/issues/1881)) ([1fd88e1](https://github.com/serialport/node-serialport/commit/1fd88e1))
- remove PURGE_RXABORT flag on flush for Windows ([#1817](https://github.com/serialport/node-serialport/issues/1817)) ([1daa919](https://github.com/serialport/node-serialport/commit/1daa919))
- RTS/CTS flow control for Windows ([#1809](https://github.com/serialport/node-serialport/issues/1809)) ([cd112ca](https://github.com/serialport/node-serialport/commit/cd112ca))
- **packages/bindings#write:** do not call native binding for empty buffers ([d347f3b](https://github.com/serialport/node-serialport/commit/d347f3b))
- stream read not working past 1 read ([#1925](https://github.com/serialport/node-serialport/issues/1925)) ([3a13279](https://github.com/serialport/node-serialport/commit/3a13279))
- use correct casts to/from HANDLE/int ([#1766](https://github.com/serialport/node-serialport/issues/1766)) ([ce503b3](https://github.com/serialport/node-serialport/commit/ce503b3))
- writing issue on Linux ([#1908](https://github.com/serialport/node-serialport/issues/1908)) ([a7d1937](https://github.com/serialport/node-serialport/commit/a7d1937))

### Chores

- remove node6 support and upgrade codebase ([#1851](https://github.com/serialport/node-serialport/issues/1851)) ([d4f15c0](https://github.com/serialport/node-serialport/commit/d4f15c0))
- add eslint mocha ([#1922](https://github.com/serialport/node-serialport/issues/1922)) ([afbc431](https://github.com/serialport/node-serialport/commit/afbc431))
- test on node 12 ([#1846](https://github.com/serialport/node-serialport/issues/1846)) ([46da21f](https://github.com/serialport/node-serialport/commit/46da21f))
- Use GitHub actions for linting ([#1927](https://github.com/serialport/node-serialport/issues/1927)) ([fb05c2d](https://github.com/serialport/node-serialport/commit/fb05c2d))

### Features

- Added packet timeout for cctalk parser ([#1887](https://github.com/serialport/node-serialport/issues/1887)) ([714e438](https://github.com/serialport/node-serialport/commit/714e438))
- Make it possible to compile on vanilla Android ([#1912](https://github.com/serialport/node-serialport/issues/1912)) ([ba2b69c](https://github.com/serialport/node-serialport/commit/ba2b69c))
- reset info.serialNumber when resetting mock ports ([#1899](https://github.com/serialport/node-serialport/issues/1899)) ([6acaac1](https://github.com/serialport/node-serialport/commit/6acaac1))
- support Exar ttyXRUSB ([#1893](https://github.com/serialport/node-serialport/issues/1893)) ([3d34d0f](https://github.com/serialport/node-serialport/commit/3d34d0f))

### BREAKING CHANGES

- flush behavior on windows no longer cancels inflight reads
- bindings now use async functions so they’ll never throw, only reject

# [7.1.0](https://github.com/serialport/node-serialport/compare/serialport@7.0.2...serialport@7.1.0) (2018-11-27)

### Features

- move cli tools to their own packages ([#1664](https://github.com/serialport/node-serialport/issues/1664)) ([103498e](https://github.com/serialport/node-serialport/commit/103498e)), closes [#1659](https://github.com/serialport/node-serialport/issues/1659)

## [@serialport/bindings@3.0.0](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.8...@serialport/bindings@3.0.0) (2019-05-16)

### Bug Fixes

- remove PURGE_RXABORT flag on flush for Windows ([#1817](https://github.com/serialport/node-serialport/issues/1817)) ([1daa919](https://github.com/serialport/node-serialport/commit/1daa919))
- RTS/CTS flow control for Windows ([#1809](https://github.com/serialport/node-serialport/issues/1809)) ([cd112ca](https://github.com/serialport/node-serialport/commit/cd112ca))

### chore

- remove node6 support and upgrade codebase ([#1851](https://github.com/serialport/node-serialport/issues/1851)) ([d4f15c0](https://github.com/serialport/node-serialport/commit/d4f15c0))

### BREAKING CHANGES

- flush behavior on windows no longer cancels inflight reads
- bindings now use async functions so they’ll never throw, only reject

## [@serialport/bindings@2.0.8](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.7...@serialport/bindings@2.0.8) (2019-04-27)

### Bug Fixes

- make node 12 work! ([00dc272](https://github.com/serialport/node-serialport/commit/00dc272))

## [@serialport/bindings@2.0.6](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.5...@serialport/bindings@2.0.6) (2019-01-12)

### Bug Fixes

- fix crash at port open ([#1772](https://github.com/serialport/node-serialport/issues/1772)) ([415891c](https://github.com/serialport/node-serialport/commit/415891c))

## [@serialport/bindings@2.0.5](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.4...@serialport/bindings@2.0.5) (2019-01-08)

### Bug Fixes

- prebuild on mojave ([#1759](https://github.com/serialport/node-serialport/issues/1759)) ([d4f5128](https://github.com/serialport/node-serialport/commit/d4f5128)), closes [/github.com/nodejs/node/pull/23685#issuecomment-430408541](https://github.com//github.com/nodejs/node/pull/23685/issues/issuecomment-430408541)
- propagate async context in callbacks ([#1765](https://github.com/serialport/node-serialport/issues/1765)) ([9b5dbdb](https://github.com/serialport/node-serialport/commit/9b5dbdb)), closes [#1751](https://github.com/serialport/node-serialport/issues/1751)
- use correct casts to/from HANDLE/int ([#1766](https://github.com/serialport/node-serialport/issues/1766)) ([ce503b3](https://github.com/serialport/node-serialport/commit/ce503b3))

## [@serialport/bindings@2.0.4](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.3...@serialport/bindings@2.0.4) (2018-12-19)

### Bug Fixes

- deprecated c++ functions for update to Node v12 ([#1743](https://github.com/serialport/node-serialport/issues/1743)) ([1eecd60](https://github.com/serialport/node-serialport/commit/1eecd60))

## [@serialport/bindings@2.0.3](https://github.com/serialport/node-serialport/compare/@serialport/bindings@2.0.2...@serialport/bindings@2.0.3) (2018-11-27)

### Bug Fixes

- **packages/bindings#write:** do not call native binding for empty buffers ([d347f3b](https://github.com/serialport/node-serialport/commit/d347f3b))

# [@serialport/parser-cctalk@4.0.0](https://github.com/serialport/node-serialport/compare/@serialport/parser-cctalk@2.0.2...@serialport/parser-cctalk@4.0.0) (2019-08-05)

### implementing packet byte timeouts due to cctalk documentation

- Added timeout parameter to constructor
- Implemented the reset of packet receiving process after timeout ([#1886])

<a name="7.0.2"></a>

## [7.0.2](https://github.com/serialport/node-serialport/compare/serialport@7.0.1...serialport@7.0.2) (2018-08-29)

**Note:** Version bump only for package serialport

- **chore:** Bump to fix build chain issues

<a name="7.0.1"></a>

## [7.0.1](https://github.com/serialport/node-serialport/compare/serialport@7.0.0...serialport@7.0.1) (2018-08-29)

**Note:** Version bump only for package serialport

- **chore:** Bump to fix build chain issues

<a name="7.0.0"></a>

# 7.0.0 (2018-08-26)

### BREAKING CHANGES

- **chore:** BREAKING: Dropping support for node 4

<a name="6.2.2"></a>

## 6.2.2 (2018-07-21)

- fix: npm and git ignore for prebuild ([fb565fd](https://github.com/serialport/node-serialport/commit/fb565fd))
- fix: Remove a new Buffer() call (#1603) ([e21fe7a](https://github.com/serialport/node-serialport/commit/e21fe7a)), closes [#1603](https://github.com/serialport/node-serialport/issues/1603)
- Add support for beaglebone serial ports. (#1600) ([384eb37](https://github.com/serialport/node-serialport/commit/384eb37)), closes [#1600](https://github.com/serialport/node-serialport/issues/1600)
- put back prebuild binary builders (#1602) ([4160aca](https://github.com/serialport/node-serialport/commit/4160aca)), closes [#1602](https://github.com/serialport/node-serialport/issues/1602)

<a name="6.2.1"></a>

## 6.2.1 (2018-06-28)

Thanks to @shodan8192 for finding and fixing a memory leak on unix systems!

- docs: fix link to parser docs ([f2285d0](https://github.com/serialport/node-serialport/commit/f2285d0))
- docs: regenerate docs ([eb053db](https://github.com/serialport/node-serialport/commit/eb053db))
- chore: change to new parser packages and upgrade (fix builds) (#1562) ([d829ada](https://github.com/serialport/node-serialport/commit/d829ada)), closes [#1562](https://github.com/serialport/node-serialport/issues/1562)
- chore: drop node 4 EOL, add node 10 🎉 (#1556) ([e1998b3](https://github.com/serialport/node-serialport/commit/e1998b3)), closes [#1556](https://github.com/serialport/node-serialport/issues/1556)
- chore(package): update conventional-changelog-cli to version 2.0.0 (#1571) ([1bf70ae](https://github.com/serialport/node-serialport/commit/1bf70ae)), closes [#1571](https://github.com/serialport/node-serialport/issues/1571)
- chore(package): update package specs (#1557) ([4ed5182](https://github.com/serialport/node-serialport/commit/4ed5182)), closes [#1557](https://github.com/serialport/node-serialport/issues/1557)
- chore(package): upgrade packages ([46d798d](https://github.com/serialport/node-serialport/commit/46d798d))
- fix: a few warnings and deprecations (#1558) ([a250f09](https://github.com/serialport/node-serialport/commit/a250f09)), closes [#1558](https://github.com/serialport/node-serialport/issues/1558)
- fix: build isn't using the right version on 32x (#1564) ([f9953f2](https://github.com/serialport/node-serialport/commit/f9953f2)), closes [#1564](https://github.com/serialport/node-serialport/issues/1564)
- fix: memory leak in unix serialport poller (#1572) ([9006bd6](https://github.com/serialport/node-serialport/commit/9006bd6)), closes [#1572](https://github.com/serialport/node-serialport/issues/1572)

<a name="6.2.0"></a>

## 6.2.0 (2018-04-18)

This is a recommended release for everyone on windows as it fixes a memory leak in write operations.

- docs: fix missing options objects and descriptions (#1504) ([e8b73c2](https://github.com/serialport/node-serialport/commit/e8b73c2)), closes [#1504](https://github.com/serialport/node-serialport/issues/1504)
- docs: node 9 is working well these days ([b585c11](https://github.com/serialport/node-serialport/commit/b585c11))
- docs: Switch to @reconbot/jsdoc-theme for docs ([a31078f](https://github.com/serialport/node-serialport/commit/a31078f))
- docs(contributing): clean up the instructions a little bit ([71f2480](https://github.com/serialport/node-serialport/commit/71f2480))
- docs(parsers): improve the parser examples ([41f1d2d](https://github.com/serialport/node-serialport/commit/41f1d2d))
- fix(windows): Reset Buffer after write operations are complete to free memory (#1547) ([a1eef11](https://github.com/serialport/node-serialport/commit/a1eef11)), closes [#1547](https://github.com/serialport/node-serialport/issues/1547)
- chore: Avoid using deprecated Buffer constructor (#1510) ([0c1533b](https://github.com/serialport/node-serialport/commit/0c1533b)), closes [#1510](https://github.com/serialport/node-serialport/issues/1510) [/nodejs.org/api/deprecations.html#deprecations_dep0005](https://github.com//nodejs.org/api/deprecations.html/issues/deprecations_dep0005)
- chore: fix package json indents ([7c9b609](https://github.com/serialport/node-serialport/commit/7c9b609))
- chore: move parsers to their new packages and clean up docs ([4bccb62](https://github.com/serialport/node-serialport/commit/4bccb62))
- chore: remove old doc file ([37a8373](https://github.com/serialport/node-serialport/commit/37a8373))
- chore(docs): Minor spelling change ([8a13e9f](https://github.com/serialport/node-serialport/commit/8a13e9f))
- chore(package): update eslint-config-standard to version 11.0.0 (#1492) ([cf5b8fb](https://github.com/serialport/node-serialport/commit/cf5b8fb)), closes [#1492](https://github.com/serialport/node-serialport/issues/1492)
- chore(package): update proxyquire to version 2.0.0 (#1511) ([bac0237](https://github.com/serialport/node-serialport/commit/bac0237)), closes [#1511](https://github.com/serialport/node-serialport/issues/1511)
- chore(package): update sinon to version 5.0.0 ([9dbccbc](https://github.com/serialport/node-serialport/commit/9dbccbc))
- chore(packages): ugprade conventional-changelog-cli@1.3.15 ([270c2be](https://github.com/serialport/node-serialport/commit/270c2be))
- chore(packages): ugprade nan@2.9.2 (#1503) ([557afa4](https://github.com/serialport/node-serialport/commit/557afa4)), closes [#1503](https://github.com/serialport/node-serialport/issues/1503)
- chore(packages): upgrade conventional-changelog@1.3.12 ([2b8f957](https://github.com/serialport/node-serialport/commit/2b8f957))
- feat: upgrade socket-io example to latest serialport and fix bug (#1505) ([86e5ab0](https://github.com/serialport/node-serialport/commit/86e5ab0)), closes [#1505](https://github.com/serialport/node-serialport/issues/1505)
- feat(linter): Added 'cc' to lint the C++ code on 'npm lint' (#1501) ([59960a3](https://github.com/serialport/node-serialport/commit/59960a3)), closes [#1501](https://github.com/serialport/node-serialport/issues/1501)
- feat(windows): Fetch USB serial number by lookups in win registry (#1483) ([45b3a2f](https://github.com/serialport/node-serialport/commit/45b3a2f)), closes [#1483](https://github.com/serialport/node-serialport/issues/1483) [#1459](https://github.com/serialport/node-serialport/issues/1459)

<a name="6.1.1"></a>

## <small>6.1.1 (2018-02-28)</small>

- chore(docs): Minor spelling and grammer changes. ([093c85d](https://github.com/serialport/node-serialport/commit/093c85d))
- fix(linux): Adds missing header file for musl libc (eg alpine) (#1487) ([02e2bfe](https://github.com/serialport/node-serialport/commit/02e2bfe)), closes [#1487](https://github.com/serialport/node-serialport/issues/1487) [#1470](https://github.com/serialport/node-serialport/issues/1470)
- docs: Add appropriate thanks to the changelog ([a3b3663](https://github.com/serialport/node-serialport/commit/a3b3663))
- docs(api): commit docs for github pages ([792459d](https://github.com/serialport/node-serialport/commit/792459d))
- docs(changelog) :fix typo (#1484) ([2da025e](https://github.com/serialport/node-serialport/commit/2da025e)), closes [#1484](https://github.com/serialport/node-serialport/issues/1484)

<a name="6.1.0"></a>

# 6.1.0 (2018-02-06)

- chore(github): lock old issues and prs ([c8d2655](https://github.com/serialport/node-serialport/commit/c8d2655))
- chore(package): update eslint-plugin-node to version 6.0.0 (#1466) ([bac94a0](https://github.com/serialport/node-serialport/commit/bac94a0)), closes [#1466](https://github.com/serialport/node-serialport/issues/1466)
- feat(linux): Custom baud rates for linux (eg 250k baudrate) (#1464) ([910438c](https://github.com/serialport/node-serialport/commit/910438c)), closes [#1464](https://github.com/serialport/node-serialport/issues/1464) Thanks to @Fumon for closing this long standing issue!

<a name="6.0.5"></a>

## 6.0.5 (2018-02-04)

- fix(changelog): drop the augular changelog as it misses commits ([7d0ff88](https://github.com/serialport/node-serialport/commit/7d0ff88))
- fix(docs): Put gitter link back ([f8f3ce5](https://github.com/serialport/node-serialport/commit/f8f3ce5))
- fix(terminal): specifying a port now behaves correctly (#1463) ([1fa20e7](https://github.com/serialport/node-serialport/commit/1fa20e7)), closes [#1463](https://github.com/serialport/node-serialport/issues/1463)
- chore(build): build on node 9 ([a819bca](https://github.com/serialport/node-serialport/commit/a819bca))
- chore(docs): fix appveyor links in readme ([388d37b](https://github.com/serialport/node-serialport/commit/388d37b))
- chore(package): update commander to version 2.13.0 ([a94fea0](https://github.com/serialport/node-serialport/commit/a94fea0))
- chore(package): update mocha to version 5.0.0 (#1446) ([e728ff3](https://github.com/serialport/node-serialport/commit/e728ff3)), closes [#1446](https://github.com/serialport/node-serialport/issues/1446)
- chore(package): update prebuild to version 7.0.0 ([bc46149](https://github.com/serialport/node-serialport/commit/bc46149))
- chore(package): update prebuild-install to version 2.4.1 ([13e8d0a](https://github.com/serialport/node-serialport/commit/13e8d0a))
- chore(package): update sinon to version 4.1.5 ([699a907](https://github.com/serialport/node-serialport/commit/699a907))
- chore(packages): upgrade eslint ([416cfe3](https://github.com/serialport/node-serialport/commit/416cfe3))
- chore(packages): upgrade sinon ([17148df](https://github.com/serialport/node-serialport/commit/17148df))
- Add null check code ([602793d](https://github.com/serialport/node-serialport/commit/602793d))
- Adding in port selection to serialport-term. (#1448) ([9f543b6](https://github.com/serialport/node-serialport/commit/9f543b6)), closes [#1448](https://github.com/serialport/node-serialport/issues/1448)
- Bumping prebuild version and updating docs with info about building against NW.js headers. (#1461) ([672c198](https://github.com/serialport/node-serialport/commit/672c198)), closes [#1461](https://github.com/serialport/node-serialport/issues/1461)
- docs(readme): Fix broken link to gitter (#1457) ([3e68e8f](https://github.com/serialport/node-serialport/commit/3e68e8f)), closes [#1457](https://github.com/serialport/node-serialport/issues/1457)
- docs(readyParser): correct the required parameters (#1392) ([dcd256d](https://github.com/serialport/node-serialport/commit/dcd256d)), closes [#1392](https://github.com/serialport/node-serialport/issues/1392)
- feat(docs): Switch to JSDOC docs not in the readme (#1383) ([60fc047](https://github.com/serialport/node-serialport/commit/60fc047)), closes [#1383](https://github.com/serialport/node-serialport/issues/1383)
- feat(parsers): Adding option to include delimiter in the DelimiterParser transform. (#1453) ([6a3ab65](https://github.com/serialport/node-serialport/commit/6a3ab65)), closes [#1453](https://github.com/serialport/node-serialport/issues/1453)
- feat(parsers): ByteLength is now more efficient (#1402) ([f7eb2f0](https://github.com/serialport/node-serialport/commit/f7eb2f0)), closes [#1402](https://github.com/serialport/node-serialport/issues/1402)

<a name="6.0.4"></a>

## [6.0.4](https://github.com/serialport/node-serialport/compare/v6.0.3...v6.0.4) (2017-10-26)

### Bug Fixes

- **packages:** just-extend isn't necessary anymore ([#1376](https://github.com/serialport/node-serialport/issues/1376)) ([8f650c3](https://github.com/serialport/node-serialport/commit/8f650c3))
- **windows:** bad parameter for ReadThread (windows) ([#1377](https://github.com/serialport/node-serialport/issues/1377)) ([6f3afbe](https://github.com/serialport/node-serialport/commit/6f3afbe))

<a name="6.0.3"></a>

## [6.0.3](https://github.com/serialport/node-serialport/compare/v6.0.0...v6.0.3) (2017-10-22)

### Bug Fixes

- **windows:** Fix async handle leak ([#1367](https://github.com/serialport/node-serialport/issues/1367)) ([c1d9d88](https://github.com/serialport/node-serialport/commit/c1d9d88)), closes [#1363](https://github.com/serialport/node-serialport/issues/1363)
- **windows:** Fix read & write bugs for windows ([#1364](https://github.com/serialport/node-serialport/issues/1364)) ([0e4b1f9](https://github.com/serialport/node-serialport/commit/0e4b1f9))

<a name="6.0.0"></a>

# [6.0.0](https://github.com/serialport/node-serialport/compare/5.0.0...v6.0.0) (2017-10-09)

### Features

- **open:** Throw on incorrect baudrate option ([#1347](https://github.com/serialport/node-serialport/issues/1347)) ([a3b8d35](https://github.com/serialport/node-serialport/commit/a3b8d35))
- **parsers:** Add cctalk parsers ([#1342](https://github.com/serialport/node-serialport/issues/1342)) ([bcb492f](https://github.com/serialport/node-serialport/commit/bcb492f))
- **test:** tone down codecov comments ([#1289](https://github.com/serialport/node-serialport/issues/1289)) ([749ffac](https://github.com/serialport/node-serialport/commit/749ffac))
- **windows:** Add ERROR_INVALID_PARAMETER to supported bindings errors ([#1354](https://github.com/serialport/node-serialport/issues/1354)) ([4ff9c67](https://github.com/serialport/node-serialport/commit/4ff9c67))

### Bug Fixes

- **docs:** Add a note about windows support ([76b7191](https://github.com/serialport/node-serialport/commit/76b7191)), closes [#1299](https://github.com/serialport/node-serialport/issues/1299)
- **docs:** add missing parsers to properties list ([3faadac](https://github.com/serialport/node-serialport/commit/3faadac))
- **docs:** correct default highWaterMark to 65536 bytes ([e83ec4e](https://github.com/serialport/node-serialport/commit/e83ec4e))
- **docs:** Fixed typo in upgrade guide ([#1321](https://github.com/serialport/node-serialport/issues/1321)) ([bf251a9](https://github.com/serialport/node-serialport/commit/bf251a9))
- **linux:** The productID should be a number not a description string ([#1279](https://github.com/serialport/node-serialport/issues/1279)) ([bf46f68](https://github.com/serialport/node-serialport/commit/bf46f68))
- **package:** update debug to version 3.0.0 ([#1292](https://github.com/serialport/node-serialport/issues/1292)) ([4987750](https://github.com/serialport/node-serialport/commit/4987750))
- **tests:** fixup for [#1279](https://github.com/serialport/node-serialport/issues/1279) ([#1285](https://github.com/serialport/node-serialport/issues/1285)) ([56074f6](https://github.com/serialport/node-serialport/commit/56074f6))
- **windows:** Add option to disable RTS ([#1277](https://github.com/serialport/node-serialport/issues/1277)) ([5b8d163](https://github.com/serialport/node-serialport/commit/5b8d163))
- **windows:** Asynchronous callbacks for reading and writing ([#1328](https://github.com/serialport/node-serialport/issues/1328)) ([69de595](https://github.com/serialport/node-serialport/commit/69de595)), closes [#1221](https://github.com/serialport/node-serialport/issues/1221)
- **windows:** Parse more types of pnpIds ([#1288](https://github.com/serialport/node-serialport/issues/1288)) ([0b554d7](https://github.com/serialport/node-serialport/commit/0b554d7)), closes [#1220](https://github.com/serialport/node-serialport/issues/1220)

### Chores

- **binaries:** Lets switch to prebuild! ([#1282](https://github.com/serialport/node-serialport/issues/1282)) ([8c36e99](https://github.com/serialport/node-serialport/commit/8c36e99))

### BREAKING CHANGES

- **binaries:** We switched to `prebuild` a breaking change because it's substantially changes our install processes. It's also possible the install flags to ensure downloading or building from source has changed slightly. That's not our api per say, but it's enough.
- **windows:** We previously hard coded to have RTS on for windows at all times it now default to off.

## Version 5.0.0 🎉

Nearly [a year in the making](https://github.com/serialport/node-serialport/compare/4.0.7...5.0.0-beta9) Node SerialPort 5.0.0 is a major rewrite that improves stability, compatibility and performance. The api surface is similar to version 4 there have been a number of changes to ensure consistent error handling and operation of a serial port. Notably we are now a [`Stream`](https://nodejs.org/api/stream.html)! We can also introduce a bindings layer. A small low level api to provide access to underlying hardware. External bindings written in other languages or targeting other platforms can now be used.

Some major cpu performance gains on unix platforms can be found and we're less buggy and better performing on Windows too.

With this release we are now only supporting LTS nodejs platforms and we are dropping NodeJS 0.10, 0.12, 5 and 7 support. We loved directly supporting so many platforms but it was getting in the way making a solid library.

See our [upgrade guide](./UPGRADE_GUIDE.md) for detail on what to change to upgrade your app to use `serialport@5.0.0`. It's not much!

Thank you to the 25 people who committed code and documentation and every person who submitted bug reports and tested changes!

Notable Changes

- [all] Streams rewrite, node serialport is now a node stream! 🎉
- [all] Drop NodeJS 0.10, 0.12, 5, and 7 support
- [all] Add node 8 support (we now only support LTS node versions)
- [all] Introduce a binding layer to provide a common low level interface to work with different platforms.
- [unix] New read/write subsystem. Write CPU dropped from 100% to 0-2%. @reconbot (Thanks to @indutny for getting me unstuck many times!)
- [windows] Rewrite reading so it's pausable thanks to @munyirik
- [docs] An overhaul how we document the api leveraging JSDOC
- [docs] An overhaul of the format and language in our docs thanks to @LappleApple

Features

- [all] `isOpen` is now a property #899
- [all] `SerialPort.list` now has more consistent output across all platforms.
- [all] `SerialPort.list` returns a promise if a callback is not provided thanks to @MikeKovarik for bug fixes
- [all] A promise aware `serialport-repl` script for debugging and testing.
- [all] add `#get` to retrieve modem status flags thanks to @jgillick!
- [all] Add a `MockBinding` object for testing serialports in your project. Used internally too!
- [all] Add electron precompiled binaries thanks to @Mike-Dax
- [all] Add regex stream parser and tests @jessicaquynh
- [all] Allow reopening after an open error #910
- [all] calls to `.drain` now queue behind port open and in progress writes reported by and with lots of testing help from @tuna-f1sh
- [all] Change parsers to be transform streams #922
- [all] Change the default `highWaterMark` to 64k to match `fs.ReadStream`
- [all] Conform to NodeJS error message formats
- [all] Exposed mocking serialport via `require('serialport/test')`
- [all] Have drain wait for pending JS write operations before calling system drain thanks to @digitalhack for reporting it
- [all] port.path is now read only #898
- [all] Refactor internals to make use of es6 and promises
- [all] Remove lowercase options #898
- [all] Remove the c++ write queue
- [all] Remove unnecessary dependencies and polyfills thanks to @mscdex
- [all] Remove v8 deprecation warnings thanks to @indutny again
- [all] Removed the `disconnect` event. The `close` event now fires with a disconnect error object in the event of a disconnection.
- [all] SerialPort can now be compressed with `uglify-es` thanks to @rwaldron
- [all] update bindings to version 1.3.0
- [all] Upgrade debug and node-pre-gyp
- [all] Upgrade to non deprecated buffer methods
- [docs] Add more installation notes on sudo, windows 10, electron and node 7
- [docs] Add socketio example @jessicaquynh
- [docs] Electron build docs #965 via @chalkers
- [docs] Mark new features in 5.0.0 with the fact they started in 5.0.0
- [docs] Update parser docs to be correct #970 via @jacobq
- [linux] `SerialPort.list` is now faster and less resource intensive thanks to @akaJes!
- [linux] Add the `ttyAP` subsystem to serialport list thanks to @fly19890211 for reporting it
- [osx] `SerialPort.list` now returns the `tty` instead of the `cu` thanks to @kishinmanglani
- [unix] Flush now gives errors and flushes tx and rx #900
- [unix] Move setting up the baudrate to the end of the `open()` to better support custom baudrates
- [windows] Refactoring of `.list` for Windows so it's significantly smaller thanks to @Zensey

Fixes

- [all] Fix baud rate parsing in `serialport-terminal` thanks to @radio-miskovice for reporting it!
- [all] Fix memory leak during opening a port thanks to @indutny
- [all] fixed a crash when pausing while reading thanks to @bminer and @baffo32 and others to debug and fix this
- [all] Upgrade nan to fix compile issues on some platforms thanks to @thom-nic
- [docs] fixed a typo thanks to @amilajack
- [docs] Spelling fixes via @Awk34
- [unix] fix a bug when poller errors would be unhandled thanks to @thiago-sylvain for reporting
- [windows] Fix file handle leak during opens when errors occur thanks to @enami
- [windows] Fix flush behavior using PurgeComm fixing #962 via @samisaham
- [windows] Fix unhandled promise rejection when calling read on Windows
- [windows] Remove read and write timeouts solving #781 via @giseburt

We also had help testing, debugging, and designing from; @alaq @arve0 @techninja @noopkat @HipsterBrown and more!

## Version 4.0.7

- [all] Fix baud rate parsing in `serialport-terminal` thanks to @radio-miskovice for reporting it!
- [windows] Refactor `SerialPort.list` to be a lot smaller and pickup vendorId, productId and locationId thanks to @zensey for #877!

## Version 4.0.6

- [all] Upgrade nan to fix compile issues on some platforms thanks to @thom-nic
- [all] Upgrade debug and node-pre-gyp

## Version 4.0.5

- [windows] Fix file handle leak during opens when errors occur thanks to @enami
- [all] Fix memory leak during opening a port thanks to @indutny

## Version 4.0.4

- Add precompiled binaries for node 7

## Version 4.0.3

- Switch to the lie promise library as it's smaller and mimics nodejs's promise closer
- Fix a bug that prevented reopening a port after an open error

## Version 4.0.2

- [unix] Fix a bug when we'd crash when pausing during a read

## Version 4.0.1

- [linux] Do not replace the native Promise when it is available thanks to @zewish for the fix

## Version 4.0.0

- Requiring `serialport` now returns the SerialPort constructor function instead of a factory object. `SerialPort.SerialPort` is now deprecated.
- `SerialPort` constructor now throws on argument errors immediately.
- `.write(writeCallback)` now only calls it's callback once after the entire write operation, it used to be called for each write cycle and return the bytes written. This reduces the number of callbacks by hundreds of thousands over a megabyte at low bandwidth.
- Disconnections now always attempt to close the port, and you'll always get a `close` event after a `disconnect` event
- All callbacks are called in the context of the port, `this` now equals the port.
- Removed `openImmediately` from the constructor's api, the functionality is now named `autoOpen` on the options object.
- Removed extraneous flow control settings from the `flowControl` option, use the specific options to set these flags now.
- Removed undocumented callbacks from the options object `disconnectedCallback` and `dataCallback`
- Renamed `serialportlist` to `serialport-list`
- Renamed `serialportterm` to `serialport-term`
- Added a contributors guide
- Added our first Arduino required integration tests
- [unix] `.drain` and `.set` now properly report errors
- [unix] Ports are now locked by default with the new `lock` options matches windows default behavior
- [windows] `.update()` now supports windows for changing baud rates
- [windows] Fixed a bug where we weren't properly opening ports (provides better support virtual com ports too) thanks to @RogerHardiman
- [windows] known issue `lock: false` doesn't work (no change in behavior)

## Version 3.1.2

- Documentation around "Illegal Instruction" errors
- Resolve some ambiguities around publishing that was causing some issues on some versions and platforms of npm and node
- [linux] bug fix in `.list()` where we weren't filtering out non block devices that are named like serial ports
- [unix] Better unix error messages
- [unix] Refactor `setBaudrate` for Unix making it easier for custom baudRate support
- [unix] Update now has less memory leaks, documentation and better error messages
- [windows] Better error messages for opening ports

## Version 3.1.1

- fix an issue with bundled deps for node-pre-gyp on npm

## Version 3.1.0

- Upgrade nan and fix warnings for node 6.0
- Update the cli tools. serialport-term can now list ports, serialport-list can now output in different formats

## Version 3.0.1

- Change from BlueBird to es6-promise to save 9.5MB from the package size (19M -> 9.5) and 130k bundle size (186.1kb -> 55.2kb)
- Experimental node 6 support

## Version 3.0.0

- `close` and `disconnect` events no longer call `removeAllListeners` and removes your event listeners. This was particularly bad for the `error` event. This is the only change and if you didn't have a special code to deal with this behavior you should probably upgrade from v2.1.2

## Version 2.1.2

- Start bundling node-pre-gyp but upgrade it to the latest as the previous version doesn't install

## Version 2.1.1

- `.list` errors are consistent across platforms and no longer has blocking `statSync` calls
- Stop bundling node-pre-gyp to prevent issues when it's already installed
- Internal restructuring

## Version 2.1.0

- Major refactor, bug fixes and docs improvements thanks to @ecksun, @fivdi, @gfcittolin, @jacobrosenthal, @mhart, @nebrius, @pabigot, @paulkaplan, @reconbot, @rodovich, @rwaldron, @sayanee, @tigoe and everyone who reported and helped debug issues!
- Fix binary paths to confirm with modern standards
- Integration tests on CI's that support it or for the folks at home with an arduino handy
- Upgrade to nan-2.2.1 for memory leak fixes and node 6 compatibility (still not supported)
- Confirm nw.js and electron compatibility
- Make the outpout of `.list` consistent between platforms and docs
- Define ambiguous flow control flags and document them
- Fix support systems who provide 0 as a valid file descriptor
- Fix race conditions when opening and closing ports that led to errors while reading and writing while closing or opening the port.
- [unix] Fix a double open bug on unix that would cause opening and closing ports repetitively to error.
- [unix] Listing serialports on linux now include more ports (including bluetooth devices eg. `/dev/rfcommXX`) and have less bugs in the output
- [windows] Remove deprecated BuildCommDCB for windows 10 support
- [windows] Fix a memory leak on windows
- [windows] Fix a 100% cpu and possible hang bug when ports were disconnected on windows.

## Version 2.0.6

- Add 5.x build to matrix, thanks @deadprogram
- Re add nmpignore, thanks @rwaldron
- Swap to upstream version of node-pre-gyp-github

## Version 2.0.5

- Fix linux port listing crash since 2.0.3 refactor, thanks @monkbroc

## Version 2.0.4

- Fix heap corruption issue affecting windows users since 2.0.0, thanks @kunalspathak

## Version 2.0.3

- Move node-pre-gyp binaries away from Amazon S3 to Github Releases page
- Fix for missing node-pre-gyp binaries, especially for windows users, since the 2.0.0 refactor which forced windows users to build from source -- generally failing due to lack of dependencies
- Unix port listing moved away from udev which was not available on all platforms, to whitelisting ttyS ttyACM ttyUSB ttyAMA devices, see #610

## Version 2.0.2

- Cleanup minor Unix gcc warnings, Thanks @rwaldron

## Version 2.0.1

- El Capitan Support, thanks @tmpvar

## Version 2.0.0

- Upgrade to NAN2 to support Node 4 support. Technically not api breaking, though NAN2 requires gcc 4.8 which for Pi Wheezy users at the very least, would be breaking. For those affected users looking to utilize serialport 2.x.x and Node 4 see https://github.com/fivdi/onoff/wiki/Node.js-v4-and-native-addons

## Version 1.7.4

- Fix OSX 10.10 build errors

## Version 1.7.3

- Fix OSX 10.10 build errors

## Version 1.7.2

- Fix OSX 10.10 build errors

## Version 1.7.1

- Fixed breaking issues in underlying code. (@voodootikigod)

## Version 1.7.0

- Fix for #518 and #498 If you pass to SerialPort function (constructor) the same object for argument "options", inside SerialPort will use it as internal object and adds handlers to it. That causes only one callback to work on different SerialPort instances. (@bullmastiffo)
- Update README.md #515 (@arahlf)
- Fix a memory leak in SerialportPoller::New (@jpilet)
- unix support for update baudrate #502 (@jacobrosenthal)
- set cloexec after open, possible fix for #468 (@jacobrosenthal)
- Added hang up on close option to constructor. #495 (@jbendes)
- Upgraded NAN to 1.8.4 due to complaints from io.js 2.x users. (@imyller)

## Version 1.6.1

- Upgraded to NAN 1.7.0
- #476 adding break signal

## Version 1.6.0

- Long standing issue resolved thanks to @jacobrosenthal for adding control signals into the serialport. YAY!
- Fix for #426
- Ability to return from inside loop #453
- Emits for close/disconnect. #452

## Version 1.5.0

- Fixed to work with io.js and node 0.11.x by upgrading to recent nan 1.6.2

## Version 1.4.8

- Simple bump for the binary.

## Version 1.4.7

- Fix for Issue #398 - Dropped sent characters on OSX and Linux
- Fix for Issue #387 - added isOpen
- removed a residual comment
- Added osx control signalling
- Fix for Issue #401
- Fix for double write callbacks.
- detect a serialport disconnect on linux.

## Version 1.4.6

- Emit error on serialport when explicit handler present. Fixes gh-369
- Fix for windows and Node 0.11.13 (atom-shell)
- Fix for broken Travis-CI build.

## Version 1.4.5

- Identified and report issue to node.js core about recent 0.11.x system.
- Removed support for 0.8.x
- Updated dependencies

## Version 1.4.4

- Fix for delete error.

## Version 1.3.0

- Merged NAN integration for Node 0.8->0.11+ compatibility (#270)

## Version 1.2.5

- Fixed an issue with pool handlers being global instead of instance isolation (Issue #252 and #255 thanks: foobarth !!! )

## Version 1.2.4

- Resolved parity error under linux as reported here: https://github.com/voodootikigod/node-serialport/issues/219

## Version 1.1.3

- Remove ATL dependency on Windows (added Visual Studio Pro requirement)
- Update build instructions
- Four small bugfixes

## Version 1.0.7

- Guaranteed in-order delivery of messages thanks to Jay Beavers and bnoordhuis

## Version 1.0.6

- Support higher baud rates in Mac OS X

## Version 1.0.5

- Added flush support.

## Version 1.0.4

- Fix for arduino firmata support on windows thanks to @jgautier.

## Version 1.0.3

- Fixed issue 65 - https://github.com/voodootikigod/node-serialport/issues/65
- Added note in readme about what is required for the system to be able to compile module, should solve 90% of issues.

## Version 1.0.2

- Fixed issue 59 - https://github.com/voodootikigod/node-serialport/issues/59

## Version 1.0.1

- Fixed items from Firmata
- Added flexibility for options (camelcase or all lower)

## Version 1.0.0

- Added Windows support thanks to Joe Ferner.
- Merged in the various underlying changes from node-serialport2 complete thanks to Joe Ferner for that!
- Verified against known installations.

## Version 0.6.5

- Added SetBaudRate, SetDTR; Custom Baud Rates
- New "close" listener when device being disconnected

## Version 0.2.8

- BufferSize fix for readstream (thanks jgautier, you rock)

## Version 0.2.7

- Make no port available be an exception not error emitted - Ticket #12.

## Version 0.2.5 - Version 0.2.6

- Debugging issue with IOWatcher not holding in the event loop in node.js.
- Converted to ReadStream instead of IOWatcher.

## Version 0.2.4

- Integrated arduino tests (rwaldron)
- Integrated options bug fix (w1nk)
- Integrated hardware flow control for crazier serial port action (w1nk)

## Version 0.2.3

- Something amazing that has since been lost and forgotten.

## Version 0.2.2

- Integrated enhanced version of arduino/readline that actually buffers the data (epeli)

## Version 0.2.1

- Refactored the parsing code upon data receipt, now allows for dynamic specification of how incoming data is handled.
- Revised creation interface to use named parameters as an object versions positional parameters.

## Version 0.2.0

- Upgraded to node v. 0.4.X compatibility

All other version are not recorded.
