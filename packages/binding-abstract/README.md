# @serialport/BindingAbstract

This Abstract binding class is the base for all serialport bindings. You wouldn't use this class directly but instead extend it to make a new binding for a different platform or underling technology.

This is currently used for the win32, linux, darwin and mock bindings.

This is how you use it.
```js
class MockBinding extends AbstractBinding {
  constructor(opt) {
    super(opt)
  }
}
```
