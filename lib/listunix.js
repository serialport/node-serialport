'use strict';
var path = require('path');
var fs = require('fs');
var async = require('async');
var exec = require('child_process').exec;

module.exports = function listUnix(callback) {
  var factory = require('./factorysingleton').getInstance();

  var spfOptions = factory.spfOptions;

  function udev_parser(udev_output, callback) {
    function udev_output_to_json(output) {
      var result = {};
      var lines = output.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line !== '') {
          var line_parts = lines[i].split('=');
          result[line_parts[0].trim()] = line_parts[1].trim();
        }
      }
      return result;
    }
    var as_json = udev_output_to_json(udev_output);
    var pnpId = as_json.DEVLINKS.split(' ')[0];
    pnpId = pnpId.substring(pnpId.lastIndexOf('/') + 1);
    var port = {
      comName: as_json.DEVNAME,
      manufacturer: as_json.ID_VENDOR,
      serialNumber: as_json.ID_SERIAL,
      pnpId: pnpId,
      vendorId: '0x' + as_json.ID_VENDOR_ID,
      productId: '0x' + as_json.ID_MODEL_ID
    };

    callback(null, port);
  }

  var dirName = (spfOptions.queryPortsByPath ? '/dev/serial/by-path' : '/dev/serial/by-id');

  fs.readdir(dirName, function (err, files) {
    if (err) {
      // if this directory is not found this could just be because it's not plugged in
      if (err.errno === 34) {
        return callback(null, []);
      }

      if (callback) {
        callback(err);
      } else {
        factory.emit('error', err);
      }
      return;
    }

    async.map(files, function (file, callback) {
      var fileName = path.join(dirName, file);
      fs.readlink(fileName, function (err, link) {
        if (err) {
          if (callback) {
            callback(err);
          } else {
            factory.emit('error', err);
          }
          return;
        }

        link = path.resolve(dirName, link);
        exec('/sbin/udevadm info --query=property -p $(/sbin/udevadm info -q path -n ' + link + ')', function (err, stdout) {
          if (err) {
            if (callback) {
              callback(err);
            } else {
              factory.emit('error', err);
            }
            return;
          }

          udev_parser(stdout, callback);
        });
      });
    }, callback);
  });
};
