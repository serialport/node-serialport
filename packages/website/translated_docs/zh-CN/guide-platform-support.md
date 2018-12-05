---
id: guide-platform-support
title: Support Environments
---
## Node.js支持情况

SerialPort官方支持所有活跃的、维护的、LTS版本 有关当前所涵盖的版本的信息，请参阅[Node.js方便时间表](https://github.com/nodejs/Release#release-schedule)。

## 支持的平台和架构

以下是`serialport`对各平台和架构的支持情况：

| 平台/架构           | 支持 |
| --------------- | -- |
| Linux / ia32¹   | ☐  |
| Linux / x64     | ☑  |
| Linux / ARM v6⁴ | ☐  |
| Linux / ARM v7⁴ | ☐  |
| Linux / ARM v8⁴ | ☐  |
| Linux / MIPSel⁴ | ☐  |
| Linux / PPC64⁴  | ☐  |
| OSX / x64³      | ☑  |
| Windows² / x86  | ☑  |
| Windows² / x64  | ☑  |

- NodeJS已经放弃了为32位linux的NodeJS 10及以上预构建的二进制文件。 因此，维持支持太难了。 不过，serialport可能可以工作，如果您自己编译nodejs和serialport。
- ²Windows 7、8、10和10支持物联网，但是我们的CI只测试Windows Server 2012 R2。
- ³OSX 10.4 及之后的版本都支持，但是我们的CI测试只在10.9.5的Xcode 6.1进行。
- ⁴ARM, MIPSel and PPC64¹ 平台不是目前我们测试的一部分或构建矩阵，但可能会工作。

## 已知的不支持版本

- 对于 `0.10` 和 `0.12`, 只支持到`serialport@4`。
- 对于`4.0`，只支持到`serialport@6`。