---
title: "Try/catch Callbacks in Javascript"
slug: try-catch-callbacks-in-javascript
date: 2015-05-08 19:46:12
---

I came across an interesting issue with a node module recently. A callback was being invoked twice. Once on a success condition, and a second time as an error condition. We typically expect a callback to be invoked once. Either on success, or error, and not twice.

In hindsight, it was all my fault why I was encountering the issue, but a pattern in the third-party code really made it hard to debug.

<!-- more -->

Imagine I have some application code like this.

```
function someFunction() {
  var timesCallbackInvoked = 0;

  someModule.someAsyncFunction(callback);

  function callback(err, response) {
    timesCallbackInvoked++;

    console.log('callback invoked: %s', timesCallbackInvoked);

    // Simulate a run time error.
    doSomethingStupid.INVALID_KEY;
  }
}
```

And the third-party code looks something like this.

```
var someModule = {
  someAsyncFunction: function (callback) {
    try {
      // Do something.
      callback();
      return;
    } catch(exception) {
      // Do something with err.
      callback();
      return;
    }
  }
};
```

Then I call my function, which in turn calls the third-party function.

```
someFunction();
```

What happens?  Well, we get a `ReferenceError`, because I'm simulating a dumb run-time error in my code with `doSomethingStupid.INVALID_KEY`. And yes, that run-time error (simulated or not) is totally my fault and not the fault of the third-party module, but something very interesting happens because of how the third-party module is written.

```
$ callback invoked: 1
$ callback invoked: 2
```

This happens because this third-party node module is invoking the callback in a `try` block.

```
try {
  // If an exception is thrown either directly in
  // this `try` block, or down the call stack of
  // `callback`, we'll trigger `catch`.
  callback();
  return;
} catch(exception) {
  // This will catch errors not just within `try`,
  // but down the call stack of the `callback`
  // if it's executed in `try`. Oops!
  callback();
  return;
}
```

So if any exceptions are thrown down that call stack, the `catch` block will trigger. Since both the `try` block and the `catch` block invoke the callback, any exceptions in `callback` will result in the callback being invoked _twice_.

Here is how I would change that third-party code.

```
var someModule = {
  someAsyncFunction: function (callback) {
    try {
      // Do something.
    } catch(exception) {
      // Do something with err.
    }
    callback();
    return;
  }
};
```

This time around, an exception will only result in the callback being invoked once, as we would expect.

```
someFunction();
$ callback invoked: 1
```

This gives us the same functionality, but ensures that the callback will only be invoked once. Either in the success case, or the error case. Not potentially both.

A simple change, but a good lesson learned. Be very careful with your error handling and when and where you may invoke a callback. The nature of how the `try`/`catch` block wraps callers can lead to this sort of confusion otherwise.
