'use strict';

const childProcess = require('child_process');
const LineStream = require('byline').LineStream;

function checkPathAndDevice(path) {
  // get only serial port names
  return (/(tty(S|ACM|USB|AMA|MFD)|rfcomm)/).test(path) && path;
}
function propName(name) {
  var props={'DEVNAME':'comName','ID_VENDOR':'manufacturer','ID_SERIAL':'serialNumber','ID_VENDOR_ID':'vendorId','ID_MODEL_ID':'productId','DEVLINKS':'pnpId'}
  return props[name.toUpperCase()];
}
function propVal(name,val) {
  if (/productId|vendorId/.test(name) && !/^0x/.test(val))
    return '0x'+val;
  if (name == 'pnpId')
    return val.split(' ')
      .map((path) => path.match(/\/by-id\/(.*)/))
      .filter(a=>a).map(a=>a[1])[0]
  return val;
}

function listLinux() {
  return new Promise((done,fail) => {
    var ude = childProcess.spawn('udevadm',['info','-e']);
    ude.on('error',fail);
    var lines = new LineStream();
    var obj,ports=[],prop,name;
    lines.on('finish',() => done(ports));
    lines.on('error',fail);
    lines.on('data',(data) => {
      var line=data.toString();
      if (name=line.match(/N\: (.*)/)) {
        if (checkPathAndDevice(name[1]))
          ports.push(obj={})
      } else
      if (name=line.match(/E\: (.*)=(.*)/)) {
        if(obj && (prop=propName(name[1])))
          obj[prop]=propVal(prop,name[2]);
      } else
      if (/P\: (.*)/.test(line))
          obj=undefined;
    });
    ude.stdout.pipe(lines);
  })
}

module.exports = listLinux;