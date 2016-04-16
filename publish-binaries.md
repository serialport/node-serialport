How to publish the pre compiled binaries.
=========================================

## Setup for Linux, Windows and OSX

Every time a new tag for the latest release is pushed to Github, the continuous integration
builds in Travis-CI and AppVeyor will generate the binaries for each platform and architecture.
We use [node-pre-gyp-github](https://github.com/bchr02/node-pre-gyp-github) on top of node-pre-gyp
to publish these binaries on Github, instead of S3.

This can be checked in the .travis.yml file and appveyor.yml file. Within these files, there are two
methods for publishing new binaries for each version: one is if a `git tag` is detected; the other
can be triggered by passing the string `[publish binary]` in the commit message itself.

We have an automated make task, we should always use this task to avoid forgetting any steps. The process for generating the binaries, publishing and releasing the npm module should be as follows:

1. Merge all changes and new features into master.
2. Fill out changelog.md.
3. Bump up npm version *AND* binary host version in `package.json`, commit and push.
4. Update the readme to refer to older docs if you're bumping a major version
5. Generate new tags based on package.json version number with `git tag 2.0.7 -a` and include the change log in the tag's annotation.
6. Push tags to Github with `git push --tags`
7. Publish to npm. BUT NOT YET. Builds can an hour and occasionally fail (mainly on Appveyor) for seemingly no reason. Restart any failures in the travis or appeveyor ui. While you wait, copy the changelog updates into the Github release field. When the entire matrix succeeds and all binaries exist run `npm publish`.

Differences for beta release
* Work in a beta branch
* Tag like: `git tag 2.0.7-beta1 -a` and include the change log in the tag's annotation.
* Publish like `npm publish . --tag beta1`

## Config Travis, AppVeyor and Github to generate all of the binaries.

Before we are able to run everything stated above some steps need to be taken.
Specifically for being able to publish the pre compiled binaries to Github. The
correct keys need to be setup in the `travis.yml` and `appveyor.yml` files. For Travis, this needs
to be done by the admin of the Github repo. For AppVeyor, this will need to be done by the owner of the AppVeyor account.

### Setting up secure keys in Travis.

Setting up the keys in Travis is easy if you have Ruby and Rubygems installed and working then run:

`gem install travis`

After the Travis gem is installed run the following command for each of the required keys:

`travis encrypt SOMEVAR=secretvalue`

And substitute the values in the `.travis.yml` file for the new ones. Detailed instructions can
be found here: http://docs.travis-ci.com/user/environment-variables/#Secure-Variables

### Setting up secure keys in AppVeyor

It is even easier than Travis to configure AppVeyor. You do not need to install anything, just go to your account and click on `encrypt tool`. Enter the values in the input field and click "Encrypt". In the same way as we do for Travis, we then need to substitute the newly generated values for the old ones.

Detailed instructions can be found here: http://www.appveyor.com/docs/build-configuration#secure-variables
