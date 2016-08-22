---
title: "Install Java To roboRIO"
date: 2018-02-22 21:28:00
---

This article is about installing Java to the roboRIO. This article is _not_ about installing Java to your developer/programmer computer. They are two separate processes.

The [FRC guides](https://wpilib.screenstepslive.com/s/currentCS/m/getting_started/l/599679-installing-eclipse-c-java) say:

> ... Java 8 is installed on the RoboRIO ...

However, that does not seem to be true if your roboRIO has Image 2017 version 8 (`FRC_roboRIO_2017_v8`) installed on it, as our team discovered.

Our team encountered an error like this when trying to deploy our code to the robot.

```
[sshexec] Connecting to roboRIO-XXXX.local:22
[sshexec] cmd : test -d /usr/local/frc/JRE

BUILD FAILED
C:\Users\Programmer\wpilib\java\current\ant\build.xml:239: Remote command failed with exit status 1
```

**Note, there may be other reasons you are seeing that error above. For instance, your build file [could be misconfigured](https://www.chiefdelphi.com/forums/showthread.php?t=133069). However, Java not being installed was the definite cause for that error in our situation.**

The image installed to a roboRIO is an armv7 Linux filesystem. The FRC Eclipse plugins use SSH to deploy your robot code to the roboRIO, and that means we can SSH to the roboRIO to poke around.

Indeed, we used [PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/) to SSH into our roboRIO and found that Java was not installed. There was no `JRE` directory at `/usr/local/frc/` on our roboRIO.

The FRC Eclipse plugins used to come with a simple utility that could be used to install Java to the roboRIO. Unfortunately, this utility does not seem to come with the latest FRC Eclipse Plugins.

We found we had to extract the roboRIO Java installer from an older version of the FRC Eclipse plugins.

You can view the archive of [FRC Eclipse Plugins](http://first.wpi.edu/FRC/roborio/release/) to see the various versions.

We found `EclipsePluginsV2017.3.1.zip` was the one we wanted.

Download that `zip` file, then extract the contents.

Navigate to this path.

```
EclipsePluginsV2017.3.1\eclipse\plugins
```

Change the extension on `edu.wpi.first.wpilib.plugins.core_2017.3.1.jar` from `.jar` to `.zip` and extract the contents.

Navigate to this path.

```
edu.wpi.first.wpilib.plugins.core_2017.3.1.zip\resources
```

View the contents of `tools.zip`.

There you should see `java-installer.jar`. Copy that file somewhere like your `Desktop`.

Download the [ORACLE JAVA SE EMBEDDED 8 Update 6](http://www.oracle.com/technetwork/java/embedded/embedded-se/downloads/javaseembedded8u6-2406243.html). Specifically, download `ARMv7 Linux - VFP, SoftFP ABI, Little Endian`. The file name should be `ejdk-8u6-fcs-b23-linux-arm-vfp-sflt-12_jun_2014.tar.gz`. It should be the second link.

Double click `java-installer.jar` to run it.

When prompted, choose `Already Downloaded` and select the `ejdk-8u6-fcs-b23-linux-arm-vfp-sflt-12_jun_2014.tar.gz` we just downloaded.

Follow the prompts to install Java to your roboRIO.

# Citations

* http://khengineering.github.io/RoboRio/faq/java/
* https://wpilib.screenstepslive.com/s/currentCS/m/getting_started/l/599679-installing-eclipse-c-java
* https://www.chiefdelphi.com/forums/showthread.php?t=133069
* https://forums.usfirst.org/forum/general-discussions/first-programs/first-robotics-competition/competition-discussion/programming-aa/java-ad/14711-robo-rio-not-receving-code
* https://www.reddit.com/r/FRC/comments/2rt75x/help_with_the_roborio/
