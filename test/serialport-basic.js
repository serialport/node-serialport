'use strict';

var serialModule = require('../test_mocks/linux-hardware'),
    SerialPort = serialModule.SerialPort,
    hardware = serialModule.hardware,
    stream = require('readable-stream'),
    through2 = require('through2'),
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
  var mockPort;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    // Create a port for fun and profit
    mockPort = hardware.createPort(existPath);
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

  describe('read', function() {
    var port;
    beforeEach(function() {
      port = new SerialPort();
    });

    describe('when not open', function() {
      it('should postpone requested read before open', function() {
        // Signal read interest
        port.once('readable', function() { });

        port.open({ comname: existPath });

        port._source.reading.should.be.true;
      });

      it('should postpone requested read while opening', function() {
        // Prevent the mock hardware from completing the open
        sandbox.stub(serialModule.SerialPortBinding, 'open');
        port.open({ comname: existPath });

        // Signal read interest
        port.once('readable', function() { });

        // Execute `open` callback
        var args = serialModule.SerialPortBinding.open.firstCall.args;
        args[2](null, args[0]);

        port._source.reading.should.be.true;
      });
    });

    describe('when open', function() {
      beforeEach(function() {
        port.open({ comname: existPath });
      });

      it('should not start unrequested reading', function() {
        port._source.reading.should.be.false;
      });

      it('should read when requested', function() {
        var data = new Buffer('blah', 'ascii');

        port.once('readable', function() {
          expect(port.read()).to.deep.equal(data);
        });

        hardware.emitData(existPath, data);
      });
    });
  });

  describe('write', function() {
    var port;
    beforeEach(function() {
      port = new SerialPort();
    });

    describe('when not open', function() {
      it('should emit error', function() {
        var spy = sinon.spy();
        port.on('error', spy);

        return assertNextTick(function() {
          port.write('blah', 'ascii');
        }, function() {
          spy.should.have.been.calledOnce;
          spy.should.have.been.calledWith(sinon.match.instanceOf(Error));
          spy.should.have.been.calledWith(sinon.match.has('message', sinon.match(/must be open/)));
        });
      });

      it('should callback with error', function() {
        // Suppress emitter throws
        port.on('error', function() {});

        var spy = sinon.spy();

        return assertNextTick(function() {
          port.write('blah', 'ascii', spy);
        }, function() {
          spy.should.have.been.calledOnce;
          spy.should.have.been.calledWith(sinon.match.instanceOf(Error));
          spy.should.have.been.calledWith(sinon.match.has('message', sinon.match(/must be open/)));
        });
      });

      it('should postpone write while opening', function() {
        var write = sandbox.stub(serialModule.SerialPortBinding, 'write');
        // Prevent the mock hardware from completing the open
        sandbox.stub(serialModule.SerialPortBinding, 'open');

        port.open({ comname: existPath });

        // Do write while opening
        var data = new Buffer('blah', 'ascii');
        var callback = function() {};
        port.write(data, callback);

        // Make sure no write was done to the hardware
        serialModule.SerialPortBinding.write.should.not.have.been.called;

        // Complete the mock hardware `open`
        var args = serialModule.SerialPortBinding.open.firstCall.args;
        args[2](null, args[0]);

        // See that a queued write was done now that opening is complete
        write.should.have.been.calledOnce;
        write.should.have.been.calledWith(sinon.match(existPath), sinon.match.same(data), sinon.match.func);
      });
    });

    describe('when open', function() {
      beforeEach(function() {
        port.open({ comname: existPath });
      });

      it('should write data', function() {
        var write = sandbox.stub(serialModule.SerialPortBinding, 'write');
        var data = new Buffer('blah', 'ascii');
        var callback = sinon.spy();

        port.write(data, callback);

        write.should.have.been.calledOnce;
        write.should.have.been.calledWith(sinon.match(existPath), sinon.match.same(data), sinon.match.func);
      });

      it('should callback when write completes', function() {
        var data = new Buffer('blah', 'ascii');
        var callback = sinon.spy();
        var write = sandbox.stub(serialModule.SerialPortBinding, 'write');
        write.yields(null, data.length);

        return assertNextTick(function() {
          port.write(data, callback);
        }, function() {
          expect(write, 'Hardware write not called').to.have.been.called;
          expect(callback, 'Done callback never called').to.have.been.called;
        });
      });

      it('should write stream', function() {
        var data = new Buffer('blah', 'ascii');
        var callback = sinon.spy();
        var write = sandbox.stub(serialModule.SerialPortBinding, 'write');
        write.yields(null, data.length);

        var input = new stream.Readable();
        input.push(data);
        input.push(null);

        return assertNextTick(function() {
          input.pipe(port);
        }, function() {
          write.should.have.been.calledOnce;
          write.should.have.been.calledWith(sinon.match(existPath), sinon.match.same(data), sinon.match.func);
        });
      });
    });
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

