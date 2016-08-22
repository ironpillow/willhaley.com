---
title: "FRC roboRIO Version Mismatch"
date: 2018-02-22 22:19:00
---

Our team encountered this error recently.

```
BUILD FAILED
C:\Users\Programming\wpilib\java\current\ant\build.xml:349: Assertion failed boolean test.
Image of roboRIO does not match plugin.
Allowed image year: 2017 version: 8.
Actual image year: 2018 version 17.
RoboRIO needs to be re-imaged or plugins updated.
```

This was quite perplexing. We saw this error after our team laptop had died. We re-installed Eclipse using the latest version of everything.

In the process, we installed the latest versions of the [Eclipse plugins](http://first.wpi.edu/FRC/roborio/release/) (`V2018.3.3` at time of writing).

We were using the latest FRC Update Suite, but our roboRIO image supposedly did not match the plugin. How confusing and annoying!

We were forced to downgrade our roboRIO. What else is there to do if the current/latest version is not `Allowed`? It could be that we were misreading the intent of this error message, but it seems pretty clear that the latest image, even though it's what is currently provided by the latest FRC Update Suite, is not allowed.

We were forced to [downgrade the image on our roboRIO]({{<relref "frc-roborio-image-firmware.markdown" >}}) by installing last year's version of the FRC Update Suite, [FRC 2017 Update Suite (FRCLabVIEWUpdate2017.2.0)](http://www.ni.com/download/first-robotics-software-2017/6492/en).

After downgrading the image and our Eclipse plugins, we were able to deploy our code.
