'use strict';

const debug = require('debug')('serialport:binding:auto-detect');

switch (process.platform) {
  case 'win32':
    debug('loading WindowsBinding');
    module.exports = require('./win32');
    break;
  case 'darwin':
    debug('loading DarwinBinding');
    module.exports = require('./darwin');
    break;
  default:
    debug('loading LinuxBinding');
    module.exports = require('./linux');
}
