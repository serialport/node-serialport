'use strict';

function listUnix(callback) {
  var udev = require('udev')
  
  var dev_list = udev.list("tty");
  var res = dev_list.map(function(udevInfo) {
    var pnpId = undefined;
    if (udevInfo.DEVLINKS) {
      for (var path of udevInfo.DEVLINKS.split(' ')) {
        if (path.indexOf('/by-id/') === -1) {
        } else {
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
  })
  callback(null, res);
}

module.exports = listUnix;
