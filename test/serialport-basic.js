'use strict';

var serialModule = require('../test_mocks/linux-hardware'),
    SerialPort = serialModule.SerialPort,
    hardware = serialModule.hardware,
    stream = require('readable-stream'),
    _ = require('lodash'),
    B = require('bluebird');

// Wraps an act, assert with a promise that acts and then
// asserts and resolves on the next tick
function assertNextTick(act, assert) {
  return new B(function(resolve, reject) {
    act();
    process.nextTick(function() {
      assert();
      resolve();
    });
  });
}

describe('SerialPort', function () {
  var sandbox;
  var existPath = '/dev/exists';

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    // Create a port for fun and profit
    hardware.createPort(existPath);
  });

  afterEach(function () {
    sandbox.restore();
    hardware.reset();
  });

  describe('Constructor', function () {
    it('should be a Duplex stream', function() {
      var port = new SerialPort(existPath);

      port.should.be.an.instanceOf(stream.Duplex);
    });

    it('should call the Duplex constructor with options', function() {
      sandbox.spy(stream, 'Duplex');
      var options = {};

      new SerialPort(options);

      stream.Duplex.should.have.been.calledOnce;
      stream.Duplex.should.have.been.calledWith(options);
    });

    it('options should be optional', function() {
      sandbox.spy(stream, 'Duplex');

      new SerialPort();

      stream.Duplex.should.have.been.calledOnce;
      stream.Duplex.firstCall.args[0].should.deep.equal({});
    });
  });

  describe('reading data', function () {
/*
    it('emits data events by default', function (done) {
      var testData = new Buffer('I am a really short string');
      var port = new SerialPort(existPath, function () {
        port.once('data', function(recvData) {
          expect(recvData).to.eql(testData);
          done();
        });
        hardware.emitData(existPath, testData);
      });
    });

    it('calls the dataCallback if set', function (done) {
      var testData = new Buffer('I am a really short string');
      var opt = {
        dataCallback: function (recvData) {
          expect(recvData).to.eql(testData);
          done();
        }
      };
      var port = new SerialPort(existPath, opt, function () {
        hardware.emitData(existPath, testData);
      });
    });
*/
  });

  describe('open', function () {
    var port;
    beforeEach(function() {
      port = new SerialPort();
    });

    it('should emit error with no parameters', function() {
      var spy = sinon.spy();
      port.on('error', spy);

      return assertNextTick(function() {
        port.open();
      }, function() {
        spy.should.have.been.calledOnce;
        spy.should.have.been.calledWith(sinon.match.instanceOf(Error));
      });
    });

    it('should use comname from options', function() {
      sandbox.stub(serialModule.SerialPortBinding, 'open');

      port.open({ comname: existPath });

      var comname = serialModule.SerialPortBinding.open.firstCall.args[0];
      comname.should.equal(existPath);
    });

    it('should support comname string as first parameter', function() {
      sandbox.stub(serialModule.SerialPortBinding, 'open');

      port.open(existPath);

      var comname = serialModule.SerialPortBinding.open.firstCall.args[0];
      comname.should.equal(existPath);
    });

    it('should use default options', function() {
      var defaults = {
        baudrate: 9600,
        parity: 'none',
        rtscts: false,
        xon: false,
        xoff: false,
        xany: false,
        rts: false,
        cts: false,
        dtr: false,
        dts: false,
        databits: 8,
        stopbits: 1,
      };
      sandbox.stub(serialModule.SerialPortBinding, 'open');

      port.open({ comname: existPath });

      var callOpts = serialModule.SerialPortBinding.open.firstCall.args[1];
      callOpts.should.contain(defaults);
    });

    it('should subscribe callback to open event', function() {
      var spy = sinon.spy();

      port.open(existPath, spy);

      spy.should.have.been.calledOnce;
    });

    describe('processing options', function() {
      function testEnumOptions(name, invalid, validValues) {
        var options = { comName: existPath };
        describe(name, function() {
          it('should error on invalid ' + name, function() {
            var spy = sinon.spy();
            port.on('error', spy);
            options[name] = invalid;

            return assertNextTick(function() {
              port.open(options);
            }, function() {
              spy.should.have.been.calledOnce;
            });
          });

          validValues.forEach(function(value) {
            it('should not error with ' + value + ' ' + name, function() {
              options[name] = value;
              port.open(options);
            });
          });
        });
      }

      testEnumOptions('stopbits', 3, [1, 1.5, 2]);
      testEnumOptions('parity', 'quantum', ['none', 'even', 'mark', 'odd', 'space']);
      testEnumOptions('databits', 22, [5, 6, 7, 8]);
      testEnumOptions('flowcontrol', ['smoke signal'], [false, true, 'xon', 'xoff', ['xany'], ['rtscts']]);

      describe('flowcontrol flags', function() {
        [['xon', 'xoff'], 'xon', 'xoff', 'xany', 'rtscts'].forEach(function(flag) {
          it('should set option for ' + flag + ' flag', function() {
            flag = _.isArray(flag) ? flag : [flag];
            var expected = _.reduce(flag, function(r, f) { r[f] = true; return r; }, {});
            sandbox.stub(serialModule.SerialPortBinding, 'open');

            port.open({ comname: existPath, flowcontrol: flag });

            var callOpts = serialModule.SerialPortBinding.open.firstCall.args[1];
            callOpts.should.contain(expected);
          });
        });

        it('should set rtscts with boolean true', function() {
          sandbox.stub(serialModule.SerialPortBinding, 'open');

          port.open({ comname: existPath, flowcontrol: true });

          var callOpts = serialModule.SerialPortBinding.open.firstCall.args[1];
          callOpts.should.contain({ rtscts: true });
        });
      });
    });
    
    /*
    it('emits data after being reopened', function (done) {
      var data = new Buffer('Howdy!');
      var port = new SerialPort(existPath, function () {
        port.close();
        port.open(function () {
          port.once('data', function (res) {
            expect(res).to.eql(data);
            done();
          });
          hardware.emitData(existPath, data);
        });
      });
    });
    */

  });

  /*
  describe('close', function () {
    it('fires a close event when it is closed', function (done) {
      var port = new SerialPort(existPath, function () {
        var closeSpy = sandbox.spy();
        port.on('close', closeSpy);
        port.close();
        expect(closeSpy.calledOnce);
        done();
      });
    });

    it('fires a close event after being reopened', function (done) {
      var port = new SerialPort(existPath, function () {
        var closeSpy = sandbox.spy();
        port.on('close', closeSpy);
        port.close();
        port.open();
        port.close();
        expect(closeSpy.calledTwice);
        done();
      });
    });
  });

  describe('disconnect', function () {
    it('fires a disconnect event', function (done) {
      var port = new SerialPort(existPath, {
        disconnectedCallback: function (err) {
          expect(err).to.not.be.ok;
          done();
        }
      }, function () {
        hardware.disconnect(existPath);
      });
    });
  });
  */

});

