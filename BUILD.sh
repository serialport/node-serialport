#!/bin/bash

# install dependencies
npm install

# first build to ensure that ".node-gyp" folder exists
node_modules/node-pre-gyp/bin/node-pre-gyp rebuild --build-from-source

# change node file to build with termios2
RESULT="$(sed 's/.*#include <termios\.h>.*/#include <asm\/termios\.h>/' ~/.node-gyp/4.4.7/include/node/uv-unix.h)"
sudo echo "$RESULT" > ~/.node-gyp/4.4.7/include/node/uv-unix.h

# build
node_modules/node-pre-gyp/bin/node-pre-gyp rebuild --build-from-source

# reverse the change made in the node file
RESULT="$(sed 's/.*#include <asm\/termios\.h>.*/#include <termios\.h>/' ~/.node-gyp/4.4.7/include/node/uv-unix.h)"
sudo echo "$RESULT" > ~/.node-gyp/4.4.7/include/node/uv-unix.h
