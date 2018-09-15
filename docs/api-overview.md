---
id: api-overview
title: Packages Overview
---

Chances are you're looking for the [`serialport`](api-serialport.md) package which provides a good set of defaults for most projects. However it is quite easy to mix and match the parts of serialport you need.

## Bindings
The Bindings provide a low level interface to work with your serialport. It is possible to use them alone but it's usually easier to use them with an interface.
- [`@serialport/bindings`](api-bindings.md) bindings for Linux, Mac and Windows
- [`@serialport/binding-abstract`](api-binding-abstract.md) as an abstract class to use if you're making your own bindings
- [`@serialport/binding-mock`](api-binding-mock.md) for a mock binding package for testing

## Interfaces
Interfaces take a binding object and provide a different API on top of it. Currently we only ship a Node Stream Interface.

- [`@serialport/stream`](api-stream.md) our traditional Node.js Stream interface

## Parsers

Parsers are used to take raw binary data and transform them into usable messages. This may include tasks such as converting the data to text, emitting useful chunks of data when they have been fully received, or even validating protocols.

Parsers are traditionally Transform streams, but Duplex streams and other non stream interfaces are acceptable.

- [`@serialport/parser-byte-length`](api-parser-byte-length.md)
- [`@serialport/parser-cctalk`](api-parser-cctalk.md)
- [`@serialport/parser-delimiter`](api-parser-delimiter.md)
- [`@serialport/parser-readline`](api-parser-readline.md)
- [`@serialport/parser-ready`](api-parser-ready.md)
- [`@serialport/parser-regex`](api-parser-regex.md)
- [`@serialport/parser-slip-encoder`](api-parser-slip-encoder.md)

## Command Line Tools

The [Command Line Tools](guide-cli.md) provide helpful utilities for working with serial ports.

- [`@serialport/list`](guide-cli.md#serialport-list)
- [`@serialport/repl`](guide-cli.md#serialport-repl)
- [`@serialport/terminal`](guide-cli.md#serialport-terminal)
