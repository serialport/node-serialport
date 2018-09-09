---
id: guide-errors
title: Error Handling
---

All functions in Node-Serialport follow two conventions:

- Argument errors throw a `TypeError` object. You'll see these when functions are called with invalid arguments.
- Runtime errors provide `Error` objects to the function's callback or emit an [`error event`](api-serialport.md) if no callback is provided. You'll see these when a runtime error occurs, like trying to open a bad port or setting an unsupported baud rate.

You should never have to wrap a Node-Serialport object in a try/catch statement if you call the functions with the correct arguments.
