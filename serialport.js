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

// Removing check for valid BaudRates due to ticket: #140
// var BAUDRATES = [500000, 230400, 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, 50];


//  VALIDATION ARRAYS
var DATABITS = [5, 6, 7, 8];
var STOPBITS = [1, 1.5, 2];
var PARITY = ['none', 'even', 'mark', 'odd', 'space'];
var FLOWCONTROLS = ["XON", "XOFF", "XANY", "RTSCTS"];



var parsers = {
  raw: function (emitter, buffer) {
    emitter.emit("data", buffer);
  },
  //encoding: ascii utf8 utf16le ucs2 base64 binary hex
  //More: http://nodejs.org/api/buffer.html#buffer_buffer
  readline: function (delimiter, encoding) {
    if (typeof delimiter === "undefined" || delimiter === null) { delimiter = "\r"; }
    if (typeof encoding  === "undefined" || encoding  === null) { encoding  = "utf8"; }
    // Delimiter buffer saved in closure
    var data = "";
    return function (emitter, buffer) {
      // Collect data
      data += buffer.toString(encoding);
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
  parity: 'none',
  rtscts: false,
  xon: false,
  xoff: false,
  xany: false,
  databits: 8,
  stopbits: 1,  
  buffersize: 256,
  parser: parsers.raw
};
function SerialPort (path, options, openImmediately) {
  options = options || {};
  openImmediately = (openImmediately === undefined || openImmediately === null) ? true : openImmediately;

  var self = this;

  stream.Stream.call(this);

  options.baudRate = options.baudRate || options.baudrate || _options.baudrate;
  // Removing check for valid BaudRates due to ticket: #140
  // if (BAUDRATES.indexOf(options.baudrate) == -1) {
  //   throw new Error('Invalid "baudrate": ' + options.baudrate);
  // }

  options.dataBits = options.dataBits || options.databits || _options.databits;
  if (DATABITS.indexOf(options.dataBits) == -1) {
    throw new Error('Invalid "databits": ' + options.dataBits);
  }
 
  options.stopbits = options.stopBits || options.stopbits || _options.stopbits;
  if (STOPBITS.indexOf(options.stopBits) == -1) {
    throw new Error('Invalid "stopbits": ' + options.stopbits);
  }
  
  options.parity = options.parity || _options.parity;
  if (PARITY.indexOf(options.parity) == -1) {
    throw new Error('Invalid "parity": ' + options.parity);
  }
  if (!path) {
    throw new Error('Invalid port specified: ' + path);
  }

  // flush defaults, then update with provided details
  options.rtscts = _options.rtscts;
  options.xon = _options.xon;
  options.xoff = _options.xoff;
  options.xany = _options.xany;
  
  if (options.flowControl || options.flowcontrol) {
    var fc = options.flowControl || options.flowcontrol;

    if (typeof fc == 'boolean') {
      options.rtscts = true;
    } else {
      fc.forEach(function (flowControl) {
        var fcup = flowControl.toUpperCase();
        var idx = FLOWCONTROLS.indexOf(fcup);
        if (idx < 0) {
          throw new Error('Invalid "flowControl": ' + fcup + ". Valid options: "+FLOWCONTROLS.join(", "));
        } else {

          // "XON", "XOFF", "XANY", "DTRDTS", "RTSCTS"
          switch (idx) {
            case 0: options.xon = true; break;
            case 1: options.xoff = true; break;
            case 2: options.xany = true;  break;
            case 3: options.rtscts = true; break;
          }
        }
      })
    }
  }

  options.bufferSize = options.bufferSize || options.buffersize || _options.buffersize;
  options.parser = options.parser || _options.parser;

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
      self.emit('error', err);
      if (callback) { callback(err); }
      return;
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
