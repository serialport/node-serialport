---
id: guide-installation
title: Installing SerialPort
---
## 安装说明

对于大多数"标准"用例(mac、Linux或者Windows x86)，Node SerialPort的安装会很简单：

```bash
npm install serialport
```

## 编译方案

我们使用 [prebuild](https://github.com/prebuild/prebuild) 编译并提供二进制库文件, 适用于最常见的用例 (linux、mac、标准处理器平台上的 windows)。 如果您有特殊情况, node serialport 也可以工作, 不过要在安装过程中编译二进制文件。 编译是通过 `node-gyp` 这需要 python 2. x, 因此请确保您已安装它, 并且系统可以找到改路径。 不支持python 3.x ！

我们假设您的系统已经拥有了任何编译node.js原生模块的依赖。 否则，在您提交“不能安装”的问题之前，请确保您拥有正确的编译环境

## 安装特殊情况

### Alpine Linux

[Alpine](http://www.alpinelinux.org/) 是一个(非常)小的发行版本, 因为它使用了 [musl](https://www.musl-libc.org/) 标准库 取代 [glibc](https://www.gnu.org/software/libc/) (大多数Linux发行版使用的库)，所以需要编译。 它通常与 docker 一起使用。 用用户已经验证了Node-Serialport可以在[alpine-node](https://github.com/mhart/alpine-node)上工作。

```bash
# If you don't have node/npm already, add that first
sudo apk add --no-cache nodejs

# Add the necessary build and runtime dependencies
sudo apk add --no-cache make gcc g++ python linux-headers udev

# Then we can install serialport, forcing it to compile
npm install serialport --build-from-source

# If you're installing as root, you'll also need to use the --unsafe-perm flag
```

### Electron

[Electron](https://electron.atom.io/) 是一个创建跨平台桌面应用框架 它带有自己版本的 node. js 运行时。

如果您需要`serialport`作为Electron项目的依赖，您必须根据您的Electron版本进行编译。

默认安装 `serialport`是根据系统已安装的node.js版本进行编译的，不是Electron的node.js运行时版本。

要为Electron重新编译 `serialport` (或者任何node.js原生模块) ，可以使用`electron-rebuild`；更多信息参考Electron的[README](https://github.com/electron/electron-rebuild/blob/master/README.md).

1. `npm install --save-dev electron-rebuild`
2. Add `electron-rebuild` to your project's package.json's install hook
3. Run `npm install`

这里提供一个例子，[`electron-serialport`](https://github.com/johnny-five-io/electron-serialport).

### NW.js

[NW.js](https://nwjs.io/)是一个基于chromium和node.js的应用运行时。

与Electron一样, nw. js 也需要针对其自身的特定标头进行编译。

为了指示 `prebuild` 可以根据正确的标头进行构建, 在项目的根目录创建一个名为`.prebuildrc`的文件，并包含以下内容：

    build_from_source=true
    runtime=node-webkit
    target=<target_version>
    

`<target_version>`是您要编译的版本 (例如, `0.26.6`)。

### Illegal Instruction

预编译的二进制文件假定一个功能完全的芯片。 例如，英特尔的[Galileo 2](https://software.intel.com/en-us/iot/hardware/galileo)缺少一些`ia32`架构的指令集。 少数其他平台也有类似的问题。 如果您在`Illegal Instruction`情况下运行Node-Serialport。您需要让npm重新编译。

```bash
# Will ask npm to build serialport during install time
npm install serialport --build-from-source

# If you have a package that depends on serialport, you can ask npm to rebuild it specifically...
npm rebuild serialport --build-from-source
```

### Mac OS X

确保您系统安装了适合系统的最小配置的XCode命令行工具 如果您最近升级了操作系统, 它可能会删除您安装的命令行工具, 请在接下来的工作之前进行验证。 要在Node.js 4.x+版本上编译`node-serialport` 您需要使用g++ v4.8或者更高版本。

### Raspberry Pi Linux

Follow the instructions for [setting up a Raspberry pi for use with Johnny-Five and Raspi IO](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots). These projects use Node Serialport under the hood.

| Revision       | CPU                   | Arm Version |
| -------------- | --------------------- | ----------- |
| A, A+, B, B+   | 32-bit ARM1176JZF-S   | ARMv6       |
| Compute Module | 32-bit ARM1176JZF-S   | ARMv6       |
| Zero           | 32-bit ARM1176JZF-S   | ARMv6       |
| B2             | 32-bit ARM Cortex-A7  | ARMv7       |
| B3             | 32-bit ARM Cortex-A53 | ARMv8       |

### sudo / root

如果您将要使用 `sudo` or root安装 Node-Serialport，`npm` 将会要求您使用unsafe参数标志。

```bash
sudo npm install serialport --unsafe-perm --build-from-source
```

如果不使用该标志, 将导致如下错误:

```bash
root@rpi3:~# npm install -g serialport
/usr/bin/serialport-list -> /usr/lib/node_modules/serialport/bin/serialport-list.js
/usr/bin/serialport-term -> /usr/lib/node_modules/serialport/bin/serialport-terminal.js


> serialport@6.0.0-beta1 install /Users/wizard/src/node-serialport
> prebuild-install || node-gyp rebuild

prebuild-install info begin Prebuild-install version 2.2.1
prebuild-install info install installing standalone, skipping download.

gyp WARN EACCES user "root" does not have permission to access the dev dir "/root/.node-gyp/6.9.1"
gyp WARN EACCES attempting to reinstall using temporary dev dir "/usr/lib/node_modules/serialport/.node-gyp"
make: Entering directory '/usr/lib/node_modules/serialport/build'
make: *** No rule to make target '../.node-gyp/6.9.1/include/node/common.gypi', needed by 'Makefile'.  Stop.
make: Leaving directory '/usr/lib/node_modules/serialport/build'
gyp ERR! build error
gyp ERR! stack Error: `make` failed with exit code: 2

```

### Ubuntu/Debian Linux

安装任何node.js版本的node-serialport最佳方法是使用[node.js 二进制发行版本](https://github.com/nodesource/distributions#installation-instructions)。 旧版本的 ubuntu 使用了错误的版本号和二进制名称安装 node. js。 如果您的Node二进制版本是 `nodejs`而不是`node`, 或者您的Node版本号是[`v0.10.29`](https://github.com/fivdi/onoff/wiki/Node.js-v0.10.29-and-native-addons-on-the-Raspberry-Pi)，那您需要遵循以下的指示。

您需要`build-essential`来编译`serialport`。 如果您的平台有二进制文件, 您将不需要它。 接下来。

    # Using Ubuntu and Node 6
    curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Using Debian and Node 6 as root
    curl -sL https://deb.nodesource.com/setup_7.x | bash -
    apt-get install -y nodejs
    

### Windows

Node-Serialport支持 windows 7、8.1、10和 10 iot。 可以使用预编译的二进制文件。但是，如果您想要用源文件夹编译，请参考[node-gyp 安装说明](https://github.com/nodejs/node-gyp#installation)。 如果所有准备工作都完成了，您可以这样来安装：

```powershell
npm install serialport --build-from-source
```

虽然Node-gyp's文档没有提及。但是，有时在 [Visual Studio](https://www.visualstudio.com/)中创建一个c++项目会有帮助，这样它就可以安装在过去两个小时的安装过程中没有安装的任何必要组件。 这样能解决一些`Failed to locate: "CL.exe"`的情况

您可能仍然会遇到的一个老问题。 当要使用多个串口是，您可以设置`UV_THREADPOOL_SIZE`环境变量等于1+x。 (默认是`4`，用来支持同时打开3个串口)。