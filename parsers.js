/*jslint node: true */
"use strict";

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

module.exports = {
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
      var parts = data.split(delimiter);
      data = parts.pop();
      parts.forEach(function (part) {
        emitter.emit('data', part);
      });
    };
  },

  // Emit a data event every `length` bytes
  byteLength: function(length) {
    var data = new Buffer(0);
    return function(emitter, buffer){
      data = Buffer.concat([data, buffer]);
      while (data.length >= length) {
        var out = data.slice(0,length);
        data = data.slice(length);
        emitter.emit('data', out);
      }
    };
  },
  
  // Emit a data event by recognizing ESP3 packets
  // Data contains ESP3Packet
  // More: https://www.enocean.com/fr/knowledge-base-doku/enoceansystemspecification:issue:faqesp2esp3/?purge=1
  esp3: function () {
    var esp3 = new ESP3();
    return function(emitter, buffer){
      esp3.tryToFillPackets(emitter, buffer);
    };

    /**
     * ESP3 packet structure through the serial port.
     *
     * Protocol bytes are generated and sent by the application
     *
     * Sync  is 0x55
     * CRC8H is CRC8 for Group ‘Header’
     * CRC8D is CRC8 for Group ‘Data’ (incl. Optional Data)
     *
     * |  1   |     2      |      1      |   1    |   1   |  u16DataLen + u8OptionalLen  |   1
     * +------+------------+-------------+--------+-------+---------------/--------------+-------+
     * | 0x55 | u16DataLen | u8OptionLen | u8Type | CRC8H |             DATAS            | CRC8D |
     * +------+------------+-------------+--------+-------+---------------/--------------+-------+
     * |              HEADER               |
     * +-----------------------------------+
     *
     * DATAS structure:
     * u16DataLen                                   |      u8OptionLen
     * +--------------------------------------------+----------------------+
     * |                   Data                     |       Optional       |
     * +--------------------------------------------+----------------------+
     *
     */
    function ESP3Packet() {
      this.syncByte = 0x55;
      this.header = {
        dataLength: undefined,
        optionalLength: undefined,
        packetType: undefined
      },
      this.crc8Header = undefined;
      this.data = undefined;
      this.optionalData = undefined;
      this.crc8Data = undefined;
    }

    /**
     * EnOcean Serial Protocol 3 (ESP3)
     *
     * Fetches ESP3 packets f.x from TCM310
     *
     * @constructor
     */
    function ESP3() {

      var callbackForNextByte = waitForSyncByte;
      this.tryToFillPackets = function(emitter, buffer) {
        for (var offset = 0; offset < buffer.length; offset++) {
          callbackForNextByte(buffer[offset]);
        }
      };

      /**
       * Waits for sync byte.
       *
       * @param byte
       */
      function waitForSyncByte(byte) {
        if (byte !== 0x55) {
          return;
        }
	    var tmp = {
          "header": new Buffer(4),
          "headerOffset": 0,
          "dataOffset": 0,
          "optionalDataOffset": 0
        };
        var currentESP3Packet = new ESP3Packet();
        callbackForNextByte = fillHeader;
      }

      /**
       * Fills header
       *
       * @param byte
       */
      function fillHeader(byte) {
        if (tmp.headerOffset < 3) {
          tmp.header.fill(byte, tmp.headerOffset);
          tmp.headerOffset++;
          return;
        }
        tmp.header.fill(byte, tmp.headerOffset);
        currentESP3Packet.header.dataLength = new Buffer([tmp.header[0], tmp.header[1]]).readUInt16BE(0);
        currentESP3Packet.header.optionalLength = tmp.header[2];
        currentESP3Packet.header.packetType = tmp.header[3];
        callbackForNextByte = fetchCRC8ForHeaderAndCheck;
      }

      /**
       * Checks CRC8 for header and starts from scratch if it fails.
       *
       * @param byte
       */
      function fetchCRC8ForHeaderAndCheck(byte) {
        if (getCrc8(tmp.header) != byte) {
          callbackForNextByte = waitForSyncByte;
          // todo : Log this fail
          return;
        }
        currentESP3Packet.crc8Header = byte;
        currentESP3Packet.data = new Buffer(currentESP3Packet.header.dataLength);
        currentESP3Packet.optionalData = new Buffer(currentESP3Packet.header.optionalLength);
        callbackForNextByte = fillData;
      }

      /**
       * Fills data.
       *
       * @param byte
       */
      function fillData(byte) {
        if (tmp.dataOffset <  currentESP3Packet.header.dataLength -1) {
          currentESP3Packet.data.fill(byte, tmp.dataOffset);
          tmp.dataOffset++;
          return;
        }
        currentESP3Packet.data.fill(byte, tmp.dataOffset);
        callbackForNextByte = fillOptionalData;
      }

      /**
       * Fills optional data.
       *
       * @param byte
       */
      function fillOptionalData(byte) {
        if (tmp.optionalDataOffset <  currentESP3Packet.header.optionalLength -1) {
          currentESP3Packet.optionalData.fill(byte, tmp.optionalDataOffset);
          tmp.optionalDataOffset++;
          return;
        }
        currentESP3Packet.optionalData.fill(byte, tmp.optionalDataOffset);
        callbackForNextByte = fetchCRC8ForDataAndCheck;
      }

      /**
       * Checks CRC8 for datas(Data + OptionalData) and emits ESP3 Packet or start from scratch if it fails.
       *
       * @param byte
       */
      function fetchCRC8ForDataAndCheck(byte){
        callbackForNextByte = waitForSyncByte;
        var datas = Buffer.concat(
          [currentESP3Packet.data, currentESP3Packet.optionalData],
          (currentESP3Packet.header.dataLength + currentESP3Packet.header.optionalLength)
        );
        if (getCrc8(datas) != byte) {
          // todo : Log this fail
          return;
        }
        currentESP3Packet.crc8Data = byte;
        emitFetchedESP3Packet();
      }

      /**
       * Emits fetched ESP3 packet on data event.
       *
       */
      function emitFetchedESP3Packet() {
        var out = currentESP3Packet;
        currentESP3Packet = new ESP3Packet();
        emitter.emit("data", out);
      }

      /**
       * Returns CRC8 value from given buffer.
       *
       * @param buffer
       * @returns byte expected crc8 value
       */
      function getCrc8(buffer) {
        var u8CRC8Table = [
          0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d,
          0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65, 0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d,
          0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd,
          0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 0xa8, 0xaf, 0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd,
          0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2, 0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea,
          0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5, 0xa2, 0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a,
          0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a,
          0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42, 0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a,
          0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c, 0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4,
          0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4,
          0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c, 0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44,
          0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34,
          0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 0x76, 0x71, 0x78, 0x7f, 0x6A, 0x6d, 0x64, 0x63,
          0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b, 0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13,
          0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb, 0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8D, 0x84, 0x83,
          0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3
        ];
        var crc8 = 0;
        for (var i = 0 ; i < buffer.length ; i++) {
          crc8 = u8CRC8Table[(crc8 ^ buffer[i])];
        }
        return crc8;
      }
    }
  }

};
