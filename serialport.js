"use strict";
/*global process require exports console */

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

var Buffer = require('buffer').Buffer;
var SerialPortBinding = require("bindings")("serialport.node");
var util = require('util');
var fs = require('fs');
var stream = require('stream');
var path = require('path');
var async = require('async');
var child_process = require('child_process');

var BAUDRATES = [500000, 230400, 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, 50];
var DATABITS = [8, 7, 6, 5];
var STOPBITS = [1, 2, 1.5];
var PARITY = ['none', 'even', 'mark', 'odd', 'space'];
var FLOWCONTROL = [false, true];

var parsers = {
  raw: function (emitter, buffer) {
    emitter.emit("data", buffer);
  },
  readline: function (delimiter) {
    if (typeof delimiter === "undefined" || delimiter === null) { delimiter = "\r"; }
    // Delimiter buffer saved in closure
    var data = "";
    return function (emitter, buffer) {
      // Collect data
      data += buffer.toString();
      // Split collected data by delimiter
      var parts = data.split(delimiter)
      data = parts.pop();
      parts.forEach(function (part, i, array) {
        emitter.emit('data', part);
      });
    };
  }
};

// The default options, can be overwritten in the 'SerialPort' constructor
var _options = {
  baudrate: 9600,
  databits: 8,
  stopbits: 1,
  parity: 'none',
  flowcontrol: false,
  buffersize: 255,
  parser: parsers.raw
};
function SerialPort (path, options, openImmediately) {
  options = options || {};
  options.__proto__ = _options;
  openImmediately = (openImmediately === undefined || openImmediately === null) ? true : openImmediately;

  var self = this;

  if (BAUDRATES.indexOf(options.baudrate) == -1) {
    throw new Error('Invalid "baudrate": ' + options.baudrate);
  }
  if (DATABITS.indexOf(options.databits) == -1) {
    throw new Error('Invalid "databits": ' + options.databits);
  }
  if (STOPBITS.indexOf(options.stopbits) == -1) {
    throw new Error('Invalid "stopbits": ' + options.stopbits);
  }
  if (PARITY.indexOf(options.parity) == -1) {
    throw new Error('Invalid "parity": ' + options.parity);
  }
  if (FLOWCONTROL.indexOf(options.flowcontrol) == -1) {
    throw new Error('Invalid "flowcontrol": ' + options.flowcontrol);
  }
  if (!path) {
    throw new Error('Invalid port specified: ' + path);
  }

  stream.Stream.call(this);

  options = options || {};
  options.baudRate = options.baudRate || options.baudrate || 9600;
  options.dataBits = options.dataBits || options.databits || 8;
  options.parity = options.parity || 'none';
  options.stopBits = options.stopBits || options.stopbits || 1;
  options.bufferSize = options.bufferSize || options.buffersize || 100;
  if (!('flowControl' in options)) {
    options.flowControl = false;
  }
  options.dataCallback = function (data) {
    options.parser(self, data);
  };
  options.errorCallback = function (err) {
    self.emit('error', err);
  };
  options.disconnectedCallback = function () {
    if (self.closing) {
      return;
    }
    self.emit('error', new Error("Disconnected"));
    self.close();
  };

  if (process.platform == 'win32') {
    path = '\\\\.\\' + path;
  }

  this.options = options;
  this.path = path;

  if (openImmediately) {
    process.nextTick(function () {
      self.open();
    });
  }
}

util.inherits(SerialPort, stream.Stream);

SerialPort.prototype.open = function (callback) {
  var self = this;
  SerialPortBinding.open(this.path, this.options, function (err, fd) {
    self.fd = fd;
    if (err) {
      return self.emit('error', err);
    }
    if (process.platform !== 'win32') {
      self.readStream = fs.createReadStream(self.path, { bufferSize: self.options.bufferSize, fd: fd });
      self.readStream.on("data", self.options.dataCallback);
      self.readStream.on("error", self.options.errorCallback);
      self.readStream.on("close", function () {
        self.close();
      });
      self.readStream.on("end", function () {
        self.emit('end');
      });
    }

    self.emit('open');
    if (callback) { callback(err); }
  });
};

SerialPort.prototype.write = function (buffer, callback) {
  var self = this;
  if (!this.fd) {
    if (callback) {
      return callback(new Error("Serialport not open."));
    } else {
      return;
    }
  }

  if (!Buffer.isBuffer(buffer)) {
    buffer = new Buffer(buffer);
  }
  SerialPortBinding.write(this.fd, buffer, function (err, results) {
    if (err) {
      self.emit('error', err);
    }
    if (callback) {
      callback(err, results);
    }
  });
};

SerialPort.prototype.close = function (callback) {
  var self = this;
  
  var fd = this.fd;
  this.fd = 0;

  if (self.closing) {
    return;
  }
  if (!fd) {
    if (callback) {
      return callback(new Error("Serialport not open."));
    } else {
      return;
    }
  }

  self.closing = true;
  try {
    if (self.readStream) {
      self.readStream.destroy();
    }

    SerialPortBinding.close(fd, function (err) {
      if (err) {
        self.emit('error', err);
      }
      if (callback) {
        callback(err);
      }
      self.emit('close');
      self.removeAllListeners();
      self.closing = false;
    });
  } catch (ex) {
    self.closing = false;
    throw ex;
  }
};

function listUnix (callback) {
  fs.readdir("/dev/serial/by-id", function (err, files) {
    if (err) {
      // if this directory is not found this could just be because it's not plugged in
      if (err.errno === 34) {
        return callback(null, []);
      }
      return console.log(err);
    }
    var dirName = "/dev/serial/by-id";
    async.map(files, function (file, callback) {
      var fileName = path.join(dirName, file);
      fs.readlink(fileName, function (err, link) {
        if (err) {
          return callback(err);
        }
        link = path.resolve(dirName, link);
        callback(null, {
          comName: link,
          manufacturer: undefined,
          pnpId: file
        });
      });
    // Suspect code per ticket: #104 removed for deeper inspection.
    // fs.readdir("/dev/serial/by-path", function(err_path, paths) {
    //   if (err_path) {
    //     if (err.errno === 34) return callback(null, []);
    //     return console.log(err);
    //   }

    //   var dirName, items;
    //   //check if multiple devices of the same id are connected
    //   if (files.length !== paths.length) {
    //     dirName = "/dev/serial/by-path";
    //     items = paths;
    //   } else {
    //     dirName = "/dev/serial/by-id";
    //     items = files;
    //   }

    //   async.map(items, function (file, callback) {
    //     var fileName = path.join(dirName, file);
    //     fs.readlink(fileName, function (err, link) {
    //       if (err) {
    //         return callback(err);
    //       }
    //       link = path.resolve(dirName, link);
    //       callback(null, {
    //         comName: link,
    //         manufacturer: undefined,
    //         pnpId: file
    //       });
    //     });
    //   }, callback);
    }, callback);
  });
}
  

if (process.platform === 'win32') {
  exports.list = SerialPortBinding.list
} else if (process.platform === 'darwin') {
  exports.list = SerialPortBinding.list;
} else {
  exports.list = listUnix;
}

SerialPort.prototype.flush = function (callback) {
  var self = this;
  var fd = this.fd;

  if (!fd) {
    if (callback) {
      return callback(new Error("Serialport not open."));
    } else {
      return;
    }
  }

  SerialPortBinding.flush(fd, function (err, result) {
    if (err) {
      self.emit('error', err);
    }
    if (callback) {
      callback(err, result);
    }
  });
};

module.exports.SerialPort = SerialPort;
module.exports.parsers = parsers;
