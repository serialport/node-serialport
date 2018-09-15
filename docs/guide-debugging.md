---
id: guide-debugging
title: Debugging
---

##  Debugging Output

We use the [debug](https://www.npmjs.com/package/debug) package and log under the `serialport` namespace. Each package has it's own scope

 - `serialport/stream` for all stream released logging
 - `serialport/binding*` for all binding related logging
 - `serialport/*` for everything

You can enable logging through environment variables. Check the [debug](https://www.npmjs.com/package/debug) docs for info.

### linux, osx
```bash
DEBUG=serialport/stream node myapp.js
DEBUG=serialport/* node myapp.js
DEBUG=* node myapp.js
```

### Windows command prompt notes

#### CMD

On Windows the environment variable is set using the `set` command.

```cmd
set DEBUG=serialport/*
```

Example:

```cmd
set DEBUG=serialport/* & node myapp.js
```

#### PowerShell (VS Code default)

PowerShell uses different syntax to set environment variables.

```cmd
$env:DEBUG = "serialport/*"
```

Example:

```cmd
$env:DEBUG='serialport/*'; node app.js
```


## Core dumps

You can enable core dumps on osx with;
```bash
ulimit -c unlimited for core dumps
```

You can "console.log" from c++ with;
```c++
fprintf(stdout, "Hellow World num=%d str=%s\n", 4, "hi");
```

## Repl

You can make use of the [`serialport-repl`](guide-cli.md#serialport-repl) command with;
```bash
serialport-repl # to auto detect an arduino
serialport-repl /path/name # to connect to a specific port
```

It will load a serialport object with debugging turned on.
