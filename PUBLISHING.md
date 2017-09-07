# How to publish node Serialport

## Setup for Linux, Windows and OSX

Every time a new tag for the latest release is pushed to Github, the continuous integration
builds in Travis-CI and AppVeyor will generate the binaries for each platform and architecture.
We use [prebuild](https://github.com/mafintosh/prebuild) to publish these binaries on Github.

This can be checked in the .travis.yml file and appveyor.yml file. Within these files, if a git tag is detected a binary will be built and published for each version on each platform.

1. Merge all changes and new features into master
2. Bump up npm version in `package.json`
3. Run `npm run changelog` and modify `CHANGELOG.md` if needed
4. Update the `.docs/README.hbs` to reference this current version and to previous major version docs then regenerate docs `npm run docs`.
5. Commit then generate new tags based on package.json version number with `git tag v5.0.0 -a` and include the change log in the tag's annotation.
6. Push tags to Github with `git push --tags`
7. `rm -rf package-lock.json node_modules build && npm install`
8. Publish to npm after builds finish. Builds can take half an hour and occasionally fail for seemingly no reason. Restart any failures in the travis or appeveyor ui. While you wait, remove the content of the Github release message so the tag's text shows. When the entire matrix succeeds and all binaries exist run `npm publish`.
9. Kick off the build matrix for either the master or beta branch on [serialport-test-pilot](https://travis-ci.org/j5js/serialport-test-pilot). It will install serialport from npm on a wide range of systems.

Differences for beta release
* Tag like: `git tag v6.0.0-beta3 -a` and include the change log in the tag's annotation.
* Publish with `npm publish --tag beta`

## Config Travis, AppVeyor and Github to generate all of the binaries.

Before we are able to run everything stated above some steps need to be taken. Specifically for being able to publish the pre compiled binaries to Github. The correct keys need to be setup in the `travis.yml` and `appveyor.yml` files. For Travis, this needs to be done by the admin of the Github repo. For AppVeyor, this will need to be done by the owner of the AppVeyor account.

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
