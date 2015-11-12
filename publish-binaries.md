How to publish the pre compiled binaries.
=========================================

## Setup for Linux, Windows and OSX

Every time a new tag for the latest release is pushed to github the continuous integration
builds in Travis-CI and AppVeyor will generate the binaries for each platform and architecture.
We use [node-pre-gyp-github](https://github.com/bchr02/node-pre-gyp-github) on top of node-pre-gyp
to put binaries on Github instead of S3.

This can be checked in the .travis.yml file and appveyor.yml file. Within the files there are two
methods for publishing new binaries for each version, one is if a `git tag` is detected; the other
can be triggered by passing the string `[publish binary]` in the commit message itself.

We have an automated make task, we should always use this task to avoid forgetting any steps. The process for generating the binaries, publishing and releasing the npm module should be as follows:

1. Merge all changes and new features into master.
2. Fill out changelog.md.
3. Bump up npm version *AND* binary host version in `package.json`, commit and push.
3. rum command: `make release`

This task will do the following for you:

1. Generate new tags based on package.json version number
2. Push tags to Github

From here, travis and appveyor detect release tag commit and build for release. As the builds (presumably) succeed you should see binaries showing up on the github releases page. While you wait, why not copy the changelog updates into the release field? You probably want to wait (hours?) for appveyor success, check that all binaries exist, and then finally don't forget to run `npm publish`


## Config Travis, AppVeyor and Github to generate all of the binaries.

Before we are able to run everything stated above some steps need to be taken.
Specifically for being able to publish the pre compiled binaries to Github. The
correct keys need to be setup in the travis and appveyor `.yml` files. This needs
to be done by the admin of the repo, in the case of Travis, and the owner of the account,
in the case of appveyor.

### Setting up secure keys in Travis.

Setting up the keys in Travis is easy if you have ruby and ruby gems installed and working then install:

`gem install travis`

After the travis gem is installed run the following command for each of the required keys:

`travis encrypt SOMEVAR=secretvalue`

And substitute the values in the `.travis.yml` file for the new ones. Detailed instructions can
be found here: http://docs.travis-ci.com/user/environment-variables/#Secure-Variables

### Setting up secure keys in AppVeyor

It is even easier than Travis, you do not need to install anything, just go to your account and
click in `encrypt tool`, there enter the values in the input field and click encrypt. Same as with
Travis we then need to substitute the newly generated values for the old ones.

Detailed instructions can be found here: http://www.appveyor.com/docs/build-configuration#secure-variables
