---
id: guide-usage
title: SerialPort Usage
---
```js
const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty-usbserial1', {
  baudRate: 57600
})
```

打开串口时, 请指定 (按此顺序)

1. 串口的路径-必需。
2. 选项-可选, 如下所述。

实例化一个`SerialPort`对象即打开一个端口。 您可以在任何时候读写(会排队等待串口打开)，大多数方法要求打开端口。 有三种方法可以检测端口何时打开。

- `open`事件产生，当端口打开的时候。
- 构造函数回调传递给`.open()`，如果您没有失能`autoOpen` 选项。 如果您失能了，则回调会被忽略。
- `.open()`函数会在端口打开后执行回调。 如果您失能了`autoOpen`选项，或者之前关闭一个打开的端口，您可以使用该方法打开端口。

```js
const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty-usbserial1')

port.write('main screen turn on', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message)
  }
  console.log('message written')
})

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message)
})
```

检测打开的错误可以在造函数的回调里使用。

```js
const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty-usbserial1', function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
})

port.write('main screen turn on', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message)
  }
  console.log('message written')
})

```

## 自动打开

当您失能了`autoOpen`选项，你需要手动打开串口。

```js
const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty-usbserial1', { autoOpen: false })

port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message)
  }

  // Because there's no callback to write, write errors will be emitted on the port:
  port.write('main screen turn on')
})

// The open event is always emitted
port.on('open', function() {
  // open logic
})
```

## 读取数据

按照以下方法，从串口获取新的数据：

```js
// Read data that is available but keep the stream in "paused mode"
port.on('readable', function () {
  console.log('Data:', port.read())
})

// Switches the port into "flowing mode"
port.on('data', function (data) {
  console.log('Data:', data)
})

// Pipe the data into another stream (like a parser or standard out)
const lineStream = port.pipe(new Readline())
```

您可以通过向串口写字符串或者buffer来发送数据：

```js
port.write('Hi Mom!')
port.write(Buffer.from('Hi Mom!'))
```

赶紧用这段代码做一些很酷的事情吧。