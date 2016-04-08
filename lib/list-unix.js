'use strict';
var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

function udevParser(output) {
  var udevInfo = output.split('\n').reduce(function(info, line) {
    if (!line || line.trim() === '') {
      return info;
    }
    var parts = line.split('=').map(function(part) {
      return part.trim();
    });

    info[parts[0].toLowerCase()] = parts[1];

    return info;
  }, {});

  var pnpId;
  if (udevInfo.devlinks) {
    udevInfo.devlinks.split(' ').forEach(function(path) {
      if (path.indexOf('/by-id/') === -1) { return }
      pnpId = path.substring(path.lastIndexOf('/') + 1);
    });
  }

  var vendorId = udevInfo.id_vendor_id;
  if (vendorId && vendorId.substring(0, 2) !== '0x') {
    vendorId = '0x' + vendorId;
  }

  var productId = udevInfo.id_model_id;
  if (productId && productId.substring(0, 2) !== '0x') {
    productId = '0x' + productId;
  }

  return {
    comName: udevInfo.devname,
    manufacturer: udevInfo.id_vendor,
    serialNumber: udevInfo.id_serial,
    pnpId: pnpId,
    vendorId: vendorId,
    productId: productId
  };
}

function listUnix(callback) {
  var dirName = '/dev';

  fs.readdir(dirName, function (err, files) {
    if (err) {
      // if this directory is not found this could just be because it's not plugged in
      if (err.errno === 34) {
        return callback(null, []);
      }
      return callback(err);
    }

    // get only serial port names
    // TODO statSync is bad bad bad
    for (var i = files.length - 1; i >= 0; i--) {
      if (
          !(/(tty(S|ACM|USB|AMA|MFD)|rfcomm)/).test(files[i]) ||
          !fs.statSync(path.join(dirName, files[i])).isCharacterDevice()
        ) {
        files.splice(i, 1);
      }
    }

    async.map(files, function (file, callback) {
      var fileName = path.join(dirName, file);
      var udevadm = 'udevadm info --query=property -p $(udevadm info -q path -n ' + fileName + ')';
      exec(udevadm, function (err, stdout) {
        if (err) {
          return callback(err);
        }
        callback(null, udevParser(stdout));
      });
    }, callback);
  });
}

module.exports = listUnix;
