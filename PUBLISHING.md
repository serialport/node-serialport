# How to publish node Serialport

Every time a new tag for the latest release is pushed to Github, the continuous integration builds in Travis-CI and AppVeyor will generate the binaries for each platform and architecture. We use [prebuild](https://github.com/mafintosh/prebuild) to publish these binaries on Github.
This can be checked in the .travis.yml file and appveyor.yml file. Within these files, if a git tag is detected a binary will be built and published for each version on each platform.

Two factor auth is required for publishing.

1. run `NPM_CONFIG_OTP=<2fa code> npx lerna publish`
2. Let everyone know 🎉

If publishing more than 3 packages at once and one of them is the bindings package, you'll need to figure out a way to get the ci's to build the binaries as github wont tell them about the new tags. You can do this by doing a minor version bump of the bindings package (only binary package as of this writing).

```
NPM_CONFIG_OTP=<2fa code> npx lerna publish --force-publish @serialport/bindings patch
```
