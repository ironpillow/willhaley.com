---
layout: post
title: "Try/catch Callbacks in Javascript"
date: 2015-05-08 19:46:12 -0500
comments: true
categories:
---

I came across an interesting issue with a node module recently.  In hindsight, it was all my fault why I was encountering the issue, but a pattern in the third-party code really made it hard to debug.

The short of it, that I took from this experience, was that you should never have a situation where you can invoke a given callback in both the `try` *and* the `catch` block.

<!-- more -->

Imagine I have some application code like this.

```
function purchase(req, res) {
  var subscription = {};

  var timesCallbackInvoked = 0;

  // Pretend billing parameters are properly set on the subscription.

  recurly.subscriptions.create(subscription, callback);

  function callback(err, response) {
    timesCallbackInvoked++;

    console.log('callback invoked: %s', timesCallbackInvoked);

    // Simulate a run time error.
    response.hey;
  }
}
```

And the third-party code looks something like this.

```
var recurly = {
  subscriptions: {
    create: function(subscription, callback) {

      try {
        // Some application code.

        return callback();
      } catch(exception) {
        return callback(exception);
      }
    }
  }
};
```

Then I call my function, which in turn calls the third-party function.

```
purchase({}, {});
```

What happens?  Well, we get an error (duh), because I'm simulating a dumb run-time error in my code.

And yes, that run-time error (simulated or not) is totally my fault, but something very interesting happens because of how the third-party module is written.

Because an exception is thrown in my callback code, the `catch` block in the third party code ends up executing.  We called `return callback()` the first time around, then the exception makes us call `return callback(exception)`.  Our callback gets invoked *twice*.

I feel like this is a huge no-no.  I've never seen it explicitly written, but I think it's widely expected and assumed that a callback will only be triggered once when passed like this.

Either because we went down the happy-path where everything worked, or because an error occurred and we returned early.  I never expect a callback to be invoked as though *both* scenarios occured.

Here is how I would change that third-party code.

```
var recurly = {
  subscriptions: {
    create: function(subscription, callback) {

      var err;

      try {
        // Some application code.
      } catch(exception) {
        err = exception;
      }

      // Ensure the callback is only invoked once.
      return callback(err);
    }
  }
};
```

This gives us the same functionality, but ensures that the callback will only be invoked once.  Either in the success case, or the error case.

A simple change, but a good lesson learned.  Be very careful with your error handling and when and where you may invoke a callback.  Also, use third-party code cautiously.

I would suggest an up-stream change to the author of the module, but the project seems to be abandoned at this point.

