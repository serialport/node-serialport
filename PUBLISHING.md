# How to publish node Serialport

Every time a new tag for the latest release is pushed to Github, the continuous integration builds in Travis-CI and AppVeyor will generate the binaries for each platform and architecture. We use [prebuild](https://github.com/mafintosh/prebuild) to publish these binaries on Github.
This can be checked in the .travis.yml file and appveyor.yml file. Within these files, if a git tag is detected a binary will be built and published for each version on each platform.

1. run `npx lerna publish`
2. Let everyone know 🎉
