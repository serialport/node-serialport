'use strict';

var assert = require('chai').assert;
var pushBindingWrap = require('../lib/push-methods');
var MockBinding = require('../lib/bindings-mock');

describe('pushBindingWrap()', function() {
  it('throws when not passed a binding', function(done) {
    try {
      pushBindingWrap({push: function() {}});
    } catch (e) {
      assert.instanceOf(e, TypeError);
      done();
    }
  });

  it('throws when not passed a push function', function(done) {
    try {
      pushBindingWrap({binding: {}});
    } catch (e) {
      assert.instanceOf(e, TypeError);
      done();
    }
  });

  it('assigns `_read()` only if not already a method', function(done) {
    var mockBinding = new MockBinding({disconnect: function() {}});
    assert.isUndefined(mockBinding._read);
    pushBindingWrap({ binding: mockBinding, push: function() {}});
    assert.equal(typeof mockBinding._read, 'function');

    var _read = function() {};
    var fakeBinding = { _read: _read};
    pushBindingWrap({ binding: fakeBinding, push: function() {}});
    assert.equal(fakeBinding._read, _read);
    done();
  });

  it('assigns `push()` only if not already a method', function(done) {
    var mockBinding = new MockBinding({disconnect: function() {}});
    assert.isUndefined(mockBinding.push);
    pushBindingWrap({ binding: mockBinding, push: function() {}});
    assert.equal(typeof mockBinding.push, 'function');

    var push = function() {};
    var fakeBinding = { push: push};
    pushBindingWrap({ binding: fakeBinding, push: function() {}});
    assert.equal(fakeBinding.push, push);
    done();
  });
});

describe('_read()', function() {
  it('calls `read()` with the right arguments', function(done) {
    var bytesToRead = 5;
    var fakeBinding = {
      read: function(buffer, offset, bytes) {
        assert.instanceOf(buffer, Buffer);
        assert.isNumber(offset);
        assert.isNumber(bytes);
        assert(bytes > 0);
        done();
      }
    };
    pushBindingWrap({binding: fakeBinding, push: function() {}});
    fakeBinding._read(bytesToRead);
  });

  it('calls push with available data', function(done) {
    var readData = new Buffer('12345!');
    var fakeBinding = {
      read: function(buffer, offset, bytes, cb) {
        readData.copy(buffer, offset);
        process.nextTick(cb.bind(null, null, readData.length, buffer));
      },
      push: function(data) {
        assert.deepEqual(data, readData);
        done();
        return false;
      }
    };
    pushBindingWrap({binding: fakeBinding, push: function() {}});
    fakeBinding._read(6);
  });
});
