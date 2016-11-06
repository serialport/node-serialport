'use strict';
var port = process.env.TEST_PORT;

if (!port) {
  console.error('Please pass TEST_PORT environment variable');
  process.exit(1);
}

// var Binding = require('../../lib/bindings-mock');
// Binding.createPort(port);
var Binding = require('../../').Binding;

var defaultOpenOptions = {
  baudRate: 9600,
  dataBits: 8,
  hupcl: true,
  lock: true,
  parity: 'none',
  rtscts: false,
  stopBits: 1,
  xany: false,
  xoff: false,
  xon: false
};

var counter = 0;
function makePort(err) {
  if (err) { throw err }
  counter++;
  if (counter % 1000 === 0) {
    console.log('Attempt ' + counter);
    debugger;
  }
  if (counter > 10000) {
    process.exit(0);
  }

  var binding = new Binding({disconnect: function() { throw 'disconnect' }});
  binding.open(port, defaultOpenOptions, function afterBindingOpen(err) {
    if (err) { throw err }
    binding.close(makePort);
  });
}

makePort();
