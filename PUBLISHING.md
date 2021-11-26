# How to publish node Serialport

Every time a new tag for the latest release is pushed to Github, the continuous integration builds in Travis-CI and AppVeyor will generate the binaries for each platform and architecture. We use [prebuild](https://github.com/mafintosh/prebuild) to publish these binaries on Github.
This can be checked in the .travis.yml file and appveyor.yml file. Within these files, if a git tag is detected a binary will be built and published for each version on each platform.

Two factor auth is required for publishing.

1. run `npm run publish`
2. if you released a new `@serialport/bindings` run `git tag @serialport/bindings@x.x.x` with the version you just released.
3. Let everyone know 🎉

Note:

CI sets the `prebuild_upload` environment variable with a GitHub token to trigger `prebuild` to upload the binaries to the release tag.
