#!/usr/bin/env node

var serialport = require('../');
var sf = require('sf');

serialport.list(function (err, results) {
  if (err) {
    throw err;
  }

  for (var i = 0; i < results.length; i++) {
    var item = results[i];
    console.log(sf('{comName,-15} {pnpId,-20} {manufacturer}', item));
  }
});
