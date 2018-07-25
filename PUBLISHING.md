# How to publish node Serialport

Every time a new tag for the latest release is pushed to Github, the continuous integration
builds in Travis-CI and AppVeyor will generate the binaries for each platform and architecture.
We use [prebuild](https://github.com/mafintosh/prebuild) to publish these binaries on Github.

This can be checked in the .travis.yml file and appveyor.yml file. Within these files, if a git tag is detected a binary will be built and published for each version on each platform.

1. Bump up npm version in `package.json`
2. Run `npm run changelog` and modify `CHANGELOG.md` if needed
3. Commit everything then generate new tags based on package.json version number with `git tag v6.0.0 -a` and include the change log in the tag's annotation. (beta `git tag v6.0.0-beta3 -a`)
4. Push tags to Github with `git push --tags`
5. Wait for the CI to publish all the binaries. Remove the content of the Github release message so the tag's text shows.
6. `rm -rf package-lock.json node_modules build && npm install`
7. When the entire matrix succeeds and all binaries exist run `npm publish` or `npm publish --tag beta`.
8. Kick off the build matrix for either the master or beta branch on [serialport-test-pilot](https://travis-ci.org/j5js/serialport-test-pilot). It will install serialport from npm on a wide range of systems.
9. Let everyone know 🎉
