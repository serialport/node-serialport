# How to publish node Serialport

Every time a new tag for the latest release is pushed to Github, the continuous integration builds in Travis-CI and AppVeyor will generate the binaries for each platform and architecture. We use [prebuild](https://github.com/mafintosh/prebuild) to publish these binaries on Github.
This can be checked in the .travis.yml file and appveyor.yml file. Within these files, if a git tag is detected a binary will be built and published for each version on each platform.

Two factor auth is required for publishing.

1. run `NPM_CONFIG_OTP=<2fa code> npm run publish`
2. Let everyone know 🎉

If publishing more than 3 packages at once and one of them is the bindings package, you'll need to figure out a way to get the ci's to build the binaries as github wont tell them about the new tags. You can do this by deleting the tag and pushing it again for the bindings package (only binary package as of this writing).

CI will only prebuild binaries if the latest commit has tags that match the current branch and the `BINARY_BUILDER` environment variable is set to `true`.

For example for version 2.0.3:

Check the list of tags in the latest commit.

```
git tag --points-at HEAD
```

That should contain `@serialport/bindings@2.0.3`.

If not, remove the remote tag and create the tag locally before updating the git remote.

```
git push --delete origin @serialport/bindings@2.0.3
git push origin @serialport/bindings@2.0.3
```

Note:

CI sets the `prebuild_upload` environment variable with a GitHub token to trigger `prebuild` to upload the binaries to the release tag. This is already configured on Travis and AppVeyor. 
