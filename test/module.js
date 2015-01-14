'use strict';

var serialModule = require('../test_mocks/linux-hardware');

describe('module', function() {
  var sandbox;
  var existPath = '/dev/exists';
  var hport;
  
  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    hport = serialModule.hardware.createPort(existPath);
  });

  afterEach(function() {
    sandbox.restore();
    serialModule.hardware.reset();
  });

  describe('interface', function() {
    it('should have proper interface', function() {
      serialModule.should.respondTo('open');
      serialModule.should.respondTo('openPort');

      serialModule.should.respondTo('list');

      serialModule.should.respondTo('SerialPort');
    });
  });

  describe('list', function() {
    it('should return a promise', function() {
      var list = serialModule.list();

      list.should.respondTo('then');
    });

    it('should resolve port list', function() {
      var ports = serialModule.hardware.getPortInfo();
      var list = serialModule.list().should.eventually.deep.equal(ports);
    });

    it('should reject with error', function() {
      serialModule.hardware.listError = new Error('Failed to get port list');

      return serialModule.list().should.eventually.be.rejected;
    });
  });

  describe('static open', function() {
    it('should create a SerialPort instance', function() {
      var port = serialModule.open({ comName: existPath });

      port.should.be.instanceOf(serialModule.SerialPort);
    });

    it('should open port', function() {
      sandbox.spy(serialModule.SerialPortBinding, 'open');

      var port = serialModule.open({ comName: existPath });

      serialModule.SerialPortBinding.open.should.have.been.calledOnce;
    });

    it('should use passed in options', function() {
      sandbox.spy(serialModule.SerialPortBinding, 'open');

      var opts = { comname: existPath };
      var port = serialModule.open(opts);

      var callOpts = serialModule.SerialPortBinding.open.firstCall.args[1];
      callOpts.comname.should.equal(opts.comname);
    });
  });
});
