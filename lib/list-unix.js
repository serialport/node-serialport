'use strict';

function listUnix(callback) {
  var udev = require('udev');
  
  var devList = udev.list("tty");
  var res = devList.map(function(udevInfo) {
    var pnpId = undefined;
    if (udevInfo.DEVLINKS) {
      var paths = udevInfo.DEVLINKS.split(' ')
      for (var p in paths) {
        var path = paths[p];
        if (path.indexOf('/by-id/') !== -1) {
          pnpId = path.substring(path.lastIndexOf('/') + 1);
        }
      }
    }
    return {
      comName: udevInfo.DEVNAME,
      manufacturer: udevInfo.ID_VENDOR,
      serialNumber: udevInfo.ID_SERIAL,
      pnpId: pnpId,
      vendorId: udevInfo.ID_VENDOR_ID,
      productId: udevInfo.ID_MODEL_ID
    }
  });
  callback(null, res);
}

module.exports = listUnix;
