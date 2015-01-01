How to publish the pre compiled binaries.
=========================================

## Setup for Linux, Windows and OSX

Every time a new tag for the latest release is pushed to github the continuous integration
builds in Travis-CI and AppVeyor will generate the binaries for each platform and architecture,
package and publish to the AS3 bucket.

This can be checked in the .travis.yml file and appveyor.yml file. Within the files there are two
methods for publishing new binaries for each version, one is if a `git tag` is detected; the other
can be triggered by passing the string `[publish binary]` in the commit message itself.

We also have an automated make task, we should always use this task to avoid forgetting any steps
(like merging into the `osx-binaries` branch).

The process for generating the binaries, publishing and releasing the npm module should be as follows:

1. Merge all changes and new features into master.
2. Bump up version of npm module in `package.json`.
3. execute make task: `make release`

This task will do the following for you:

1. Generate new tags based on package.json version number
2. Push tags to Github
3. Checkout into `osx-binaries` branch
4. Merge `master` into `osx-binaries`
5. Push `osx-binaries`
6. Checkout master
7. Finally it will run `npm publish`

With this we will make sure the binaries for all platforms and architectures will be generated each time
a new version is released.


## Config Travis, AppVeyor and Github to generate all of the binaries.

Before we are able to run everything stated above some steps need to be taken.
Specifically for being able to publish the pre compiled binaries to AWS-S3. The
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

### OSX binaries

Since Travis does not support config file for multiple OSs we need to create a new branch that contains
a slightly different version of the .travis.yml file to compile for OSX. The branch needs to be called
`osx-binaries` and be based of `master` once the pre-compiled binaries PR has been merged in.

If we want to release a new version of the OSX binaries manually we can do it by pushing a new commit to
the osx-binaries branch that contains the `[publish binary]` string, we can push an empty commit as follows:

```bash
$ git checkout osx-binaries
$ git commit --allow-empty -m "Publish new version of pre-compiled binaries to AS3 [publish binary]"
$ git push origin osx-binaries
```

The travis script will verify that the commit message contains the string `[publish binary]` and upload the
binary packages.
