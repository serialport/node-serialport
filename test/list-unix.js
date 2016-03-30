'use strict';

var chai = require('chai');
var expect = chai.expect;
var listUnix = require('../test_mocks/list-unix');

var ports = {
  'ttyS0': 'DEVNAME=/dev/ttyS0\n' +
           'DEVPATH=/devices/platform/serial8250/tty/ttyS0\n' +
           'MAJOR=4\n' +
           'MINOR=64\n' +
           'SUBSYSTEM=tty\n',
  'ttyS1': 'DEVNAME=/dev/ttyS1\n' +
           'DEVPATH=/devices/platform/serial8250/tty/ttyS1\n' +
           'MAJOR=4\n' +
           'MINOR=65\n' +
           'SUBSYSTEM=tty\n',
  'ttyUSB-Arduino': 'DEVNAME=/dev/ttyUSB-Arduino\n' +
            'ID_VENDOR=Arduino (www.arduino.cc)\n' +
            'ID_SERIAL=752303138333518011C1\n' +
            'id_vendor_id=2341\n' +
            'id_model_id=0043\n',
  'ttyAMA_im_a_programmer': 'DEVNAME=/dev/ttyAMA_im_a_programmer\n'
};

var portOutput = [
  {
    comName: '/dev/ttyS0',
    manufacturer: undefined,
    serialNumber: undefined,
    pnpId: undefined,
    vendorId: undefined,
    productId: undefined
  },
  {
    comName: '/dev/ttyS1',
    manufacturer: undefined,
    serialNumber: undefined,
    pnpId: undefined,
    vendorId: undefined,
    productId: undefined
  },
  {
    comName: '/dev/ttyUSB-Arduino',
    manufacturer: 'Arduino (www.arduino.cc)',
    serialNumber: '752303138333518011C1',
    pnpId: undefined,
    vendorId: '0x2341',
    productId: '0x0043'
  },
  {
    comName: '/dev/ttyAMA_im_a_programmer',
    manufacturer: undefined,
    serialNumber: undefined,
    pnpId: undefined,
    vendorId: undefined,
    productId: undefined
  }
];

describe('listUnix', function () {
  it('lists available serialports', function(done) {
    listUnix.setPorts(ports);
    listUnix(function(err, ports) {
      expect(err).to.not.be.ok;
      expect(ports).to.deep.equal(portOutput);
      done();
    });
  });
});
