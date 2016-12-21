'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

function promisify(func) {
  return function(arg) {
    return new Promise(function(resolve, reject) {
      func(arg, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  };
}

function promisedFilter(func) {
  return function(data) {
    const shouldKeep = data.map(func);
    return Promise.all(shouldKeep).then(function(keep) {
      return data.filter(function(path, index) {
        return keep[index];
      });
    });
  };
}

const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);
const execAsync = promisify(childProcess.exec);

function udevParser(output) {
  const udevInfo = output.split('\n').reduce(function(info, line) {
    if (!line || line.trim() === '') {
      return info;
    }
    const parts = line.split('=').map(function(part) {
      return part.trim();
    });

    info[parts[0].toLowerCase()] = parts[1];

    return info;
  }, {});

  let pnpId;
  if (udevInfo.devlinks) {
    udevInfo.devlinks.split(' ').forEach(function(path) {
      if (path.indexOf('/by-id/') === -1) { return }
      pnpId = path.substring(path.lastIndexOf('/') + 1);
    });
  }

  let vendorId = udevInfo.id_vendor_id;
  if (vendorId && vendorId.substring(0, 2) !== '0x') {
    vendorId = `0x${vendorId}`;
  }

  let productId = udevInfo.id_model_id;
  if (productId && productId.substring(0, 2) !== '0x') {
    productId = `0x${productId}`;
  }

  return {
    comName: udevInfo.devname,
    manufacturer: udevInfo.id_vendor,
    serialNumber: udevInfo.id_serial,
    pnpId,
    vendorId,
    productId
  };
}

function checkPathAndDevice(path) {
  // get only serial port names
  if (!(/(tty(S|ACM|USB|AMA|MFD)|rfcomm)/).test(path)) {
    return false;
  }
  return statAsync(path).then(function(stats) {
    return stats.isCharacterDevice();
  });
}

function lookupPort(file) {
  const udevadm = `udevadm info --query=property -p $(udevadm info -q path -n ${file})`;
  return execAsync(udevadm).then(udevParser);
}

function listLinux(callback) {
  const dirName = '/dev';
  readdirAsync(dirName)
    .catch(function(err) {
      // if this directory is not found we just pretend everything is OK
      // TODO Deprecate this check?
      if (err.errno === 34) {
        return [];
      }
      throw err;
    })
    .then(function(data) { return data.map(function(file) { return path.join(dirName, file) }) })
    .then(promisedFilter(checkPathAndDevice))
    .then(function(data) { return Promise.all(data.map(lookupPort)) })
    .then(function(data) { callback(null, data) }, function(err) { callback(err) });
}

module.exports = listLinux;
