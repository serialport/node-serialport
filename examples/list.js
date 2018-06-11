/* eslint-disable node/no-missing-require */
'use strict';

// Use a Readline parser

const SerialPort = require('../lib/index');

SerialPort.list().then((list)=>{
    console.log(list);
}).catch((error)=>{
    console.error(error);
});
