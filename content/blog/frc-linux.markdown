---
title: "Setting up a Linux Ubuntu 16.04.3 Box for FRC 2018"
date: 2017-01-31 21:12:00
lastmod: 2019-01-04 22:45:00
aliases: [
    /blog/frc-2017-linux/
]
disqus: true
---

Previous instructions are deprecated and are no longer available here. The version of Ubuntu specified in this guide is a bit old now, and as of FRC 2019, the build system and guides have changed significantly. FRC now recommends VS Code (yay) and a different simulation environment.

* [Installing C++ and Java Development Tools for FRC](https://wpilib.screenstepslive.com/s/currentCS/m/java/l/1027503-installing-c-and-java-development-tools-for-frc)
* [Playing Field | FIRST](https://www.firstinspires.org/robotics/frc/playing-field)
* [What is Synthesis? | Creative Minds](https://www.youtube.com/watch?v=8a1eslYd94w&feature=youtu.be)
* [Tutorials](http://synthesis.autodesk.com/tutorials.html)

The latest simulation software does not support Linux at all, unfortunately (darn).

> Operating System
>
> *    64-bit Microsoft® Windows® 10 (preferred) Anniversary Update (version 1607 or higher)
> *    64-bit Microsoft Windows 8.1
> *    64-bit Microsoft Windows 7 SP1 with Update KB4019990

So one of the primary purposes of this article is now moot. A major accomplishment in this article was to get a simulation environment working in Linux, and that is not currently possible at all (or at least, non-obvious and requires more research).

Also, there are now [updated canonical documents regarding Linux support from FRC/WPILib](https://wpilib.screenstepslive.com/s/currentCS/m/java/l/1027503-installing-c-and-java-development-tools-for-frc), so these instructions would merely muddy the waters regarding a "normal" setup guide for Linux.

If the day comes when FRC supports Linux for simulation with the latest tools, or I find a simple way to integrate a Windows simulation environment with a Linux development environment (probably possible with some build scripts, rsync, etc), then I'll update this guide or direct to helpful resources on the topic.

<!--
These instructions are meant to help set up an Ubuntu Xenial 16.04.3 LTS development environment for the [FRC 2018 FIRST POWER UP](https://www.firstinspires.org/robotics/frc/game-and-season) competition. This guide is written with Java in mind and not C++. With these steps, you should be able to run a simulated environment with which you can test your robot code for FRC 2018.

# Index

* [Warnings]({{< relref "#warnings" >}})
* [Install Java]({{< relref "#install-java" >}})
* [Install Eclipse]({{< relref "#install-eclipse" >}})
* [Install FRC Toolchain]({{< relref "#install-frc-toolchain" >}})
* [Install Eclipse FRC Plugins]({{< relref "#install-eclipse-frc-plugins" >}})
* [Install Gazebo]({{< relref "#install-gazebo" >}})
* [Install FRCSim]({{< relref "#install-frcsim" >}})
* [Install model and world files]({{< relref "#install-model-and-world-files" >}})
* [Create a sample application]({{< relref "#create-a-sample-application" >}})
* [Run]({{< relref "#run-a-name-run-a" >}})
* [Next steps]({{< relref "#next-steps" >}})
* [Troubleshooting]({{< relref "#troubleshooting" >}})
* [Docs]({{< relref "#docs" >}})

## Warnings!

* You should acquire a reliable Internet connection to run these steps, as you will be downloading a lot of software
* You must run these steps in the specified order
* You must wait for a step to finish before moving to the next step
* I highly recommend a fresh Ubuntu install if possible
* You need a fast machine (Core i5 equivalent or better, 8GB RAM minimum) to run the simulator
* Simulation is not a replacement for testing on your real world physical Robot
* I have found it is almost impossible to get CAD models of your robot into the simulation environment
* Driver Station does not run on Linux, [only on Windows](https://wpilib.screenstepslive.com/s/currentCS/m/getting_started/l/599670-installing-the-frc-2018-update-suite-all-languages)
* FRCSim is not well maintained and may be replaced soon
* You must install outdated software to get this to work
* This guide is constantly updated, so older user comments should be read with caution

<span class="warning">**Based on those warnings you should consider whether or not this is worth your time and effort.**</span>

# Install Java

Add the `webupd8team` repository to your machine. This repository will be used to download Oracle Java installers, which make for a simpler Java install process than manually downloading and installing Java.

```
sudo add-apt-repository ppa:webupd8team/java
```

Refresh your machine's repository package list now that we have added the new respository above.

```
sudo apt-get update
```

Install Java 8.

```
sudo apt-get install oracle-java8-installer
```

Edit the `/etc/environment` file.

```
sudo nano /etc/environment
```

**Append a new line** with this content. This defines a system-wide variable named `JAVA_HOME` that references the install location of Java on your machine.

```
JAVA_HOME="/usr/lib/jvm/java-8-oracle"
```

Immediately load the `/etc/environment` configuration file you just created.

```
source /etc/environment
```

List the contents of your Java installation directory using your new `$JAVA_HOME` variable.

```
ls $JAVA_HOME
```

You should see contents like this, which means that your system is properly referencing the Java installation directory we set above.

```
bin             LICENSE
COPYRIGHT       man
db              README.html
include         release
javafx-src.zip  src.zip
jre             THIRDPARTYLICENSEREADME-JAVAFX.txt
lib             THIRDPARTYLICENSEREADME.txt
```

# Install Eclipse

Add the `ubuntu-make` repository to install a modern version of the Eclipse IDE.

```
sudo add-apt-repository ppa:ubuntu-desktop/ubuntu-make
```

Refresh your machine's repository package list now that we have added the new respository above.

```
sudo apt-get update
```

Install `ubuntu-make`.

```
sudo apt install ubuntu-make
```

Install Eclipse using `umake`. Use the default options when prompted.

```
umake ide eclipse
```

`Launch` Eclipse after the installation is finished.

When prompted to choose a `workspace`, use the default value and click `Ok` unless you know what you are doing. The workspace is the directory where Eclipse will save your programming projects, and defaults to `$HOME/workspace`.

Verify that Eclipse is using the **Oracle** version of Java. There are other versions of Java that may be compatible, but (in my FRC experience) are not as stable.

In Eclipse, navigate to `Window` -> `Open Perspective` -> `Java` so that we use the Java view in Eclipse.

In Eclipse, navigate to `Window` -> `Preferences` -> `Java` -> `Installed JREs`.

Verify that the **Oracle** version of Java is listed there.

## Install FRC Toolchain

Add the `wpilib` repository to your machine. This repository will be used to install FRC software.

```
sudo apt-add-repository ppa:wpilib/toolchain
```

Update the `wpilib` repo to install packages for Ubuntu yakkety. We need this so that we get a slightly older version of the FRC software.

```
sudo sed -i \
    's/xenial/yakkety/g' \
    /etc/apt/sources.list.d/wpilib-ubuntu-toolchain-xenial.list
```

Refresh your machine's repository package list now that we have added the new respository above.

```
sudo apt-get update
```

Install various required libraries and tools. The `frc-toolchain` includes compilers, libraries, and tools required for programming our Robot [source](http://first.wpi.edu/FRC/roborio/toolchains/). `git` can be used for code management [source](https://git-scm.com/) and will be required to install some other software later in this guide.

This code block can be copied and pasted into your terminal as is.

```
sudo apt-get install \
  libc6-i386 libwebkitgtk-1.0-0 curl \
  git jstest-gtk gradle \
  frc-toolchain meshlab cmake libprotobuf-dev \
  libprotoc-dev protobuf-compiler
```

Verify the version of `frc-toolchain` that was installed.

```
sudo dpkg-query \
    --showformat='${Version}\n' \
    --show frc-toolchain
```

The output of the above command should be `2017.0~yakkety1`. I realize this is **not the latest version**, but we need it for simulation to work properly.

## Install Eclipse FRC Plugins

Launch Eclipse if it is not already open.

We will now install a **specific version** of the Eclipse FRC Java plugin. This will add extra functionality to Eclipse that is specific to FRC. The Eclipse plugins for FRC assist you in building, deploying, and testing Robot projects.

Download the plugin to your `$HOME/Downloads` directory.

```
curl -o $HOME/Downloads/EclipsePluginsV2017.3.1.zip \
    "http://first.wpi.edu/FRC/roborio/release/EclipsePluginsV2017.3.1.zip"
```

Unzip the plugins to the `$HOME/Downloads` directory.

```
unzip \
    $HOME/Downloads/EclipsePluginsV2017.3.1.zip \
    -d $HOME/Downloads/EclipsePluginsV2017.3.1
```

In Eclipse navigate to `Help` -> `Install new software` -> `Add...`.

Enter a name like `FRC Plugins (local v2017.3.1)` and click `Local...`.

In the filesystem navigator, navigate to `Downloads` -> `EclipsePluginsV2017.3.1` -> `eclipse` and click `Ok` when done.

Expand the `WPILib Robot Development` category.

Check the box for the `Robot Java Development` plugin. Note that the version number should be `2017.3.1` for this plugin.

Click `Next`, and follow the wizard and confirm and agree to the prompts presented to you.

You may see a message that says `Warning: You are installing software that contains unsigned content`. Although this is not ideal, it is safe to click `Ok`.

Eclipse will prompt you to restart itself. Let it.

**Eclipse will install critical files after it restarts. Be patient!**

## Install Gazebo

Gazebo is the simulator software that models a 3D world through which we can test our robot.

The install process is wonderfully simple, but this is actually a very complex and resource intensive piece of software.

Gazebo will simulate the real world so that you can test your robot code in a (modeled) 3D space.

Note the `sed` command so that we can install an older version of Gazebo.

```
curl -ssL http://get.gazebosim.org | sed s/GZ_VER=9/GZ_VER=8/g | sh
```

## Install FRCSim

> With FRCSim, you should be able to finish 90% Of your programming without ever touching a RoboRIO.

> We want you to be able to test your code BEFORE you put in on your robot, and before the robot is even built.

> FRCSim allows robot code written in C++ or Java that normally runs on your RoboRIO to be run on your laptop or desktop. It connects to custom robot models in the Gazebo robot simulator. [source](https://wpilib.screenstepslive.com/s/currentCS/m/frcsim/l/480159-introduction-to-frcsim)

Use `curl` to download FRCSim files to your machine.

```
curl -o \
    $HOME/Downloads/simulation-2017.3.1.zip \
    http://first.wpi.edu/FRC/roborio/maven/release/edu/wpi/first/wpilib/simulation/simulation/2017.3.1/simulation-2017.3.1.zip
```

Create a directory for various simulation files. Note that Eclipse automatically created `$HOME/wpilib` when we installed the FRC Plugin. We are now manually creating `$HOME/wpilib/simulation`.

```
mkdir $HOME/wpilib/simulation
```

Unzip our simulation files to the directory we just created.

```
unzip \
    $HOME/Downloads/simulation-2017.3.1.zip \
    -d $HOME/wpilib/simulation
```

Create a system-wide [symlink](https://en.wikipedia.org/wiki/Symbolic_link) to the `frcsim` (FRC simulator) program.

```
sudo ln -s $HOME/wpilib/simulation/frcsim /usr/bin/frcsim
```

Create a system-wide symlink to the `sim_ds` (simulated driver station) program.

```
sudo ln -s $HOME/wpilib/simulation/sim_ds /usr/bin/sim_ds
```

We must manually compile the wpilib simulation plugins for FRCsim in order for the simulator to work properly on Linux.

Navigate to the `$HOME/Downloads` directory in your terminal.

```
cd $HOME/Downloads
```

Use `git` to download some `wpilib` code that we must compile on our machine.

```
git clone https://github.com/wpilibsuite/allwpilib
```

Navigate to the `allwpilib` code that we just downloaded.

```
cd $HOME/Downloads/allwpilib
```

Check out a specific version of the code we just downloaded. Note that this matches the versions of the Eclipse Plugin and the simulation files. It also (roughly) matches our version of the `frc-toolchain`.

```
git checkout v2017.3.1
```

Run the `gradelw` script. That script will use [gradle](https://gradle.org/), a software build tool, to compile the software we just downloaded. This script takes a while to run. Though, occasionally, I see this script freeze and hang. **If that happens, it is safe to kill this operation and re-run it**.

```
./gradlew build -PmakeSim
```

Copy the plugins we just compiled into our simulation plugins directory.

```
cp ./build/install/simulation/plugins/* \
    $HOME/wpilib/simulation/plugins/
```

## Install model and world files

2018 simulation files have not yet been released (and the 2017 files were never shared either) but we can install the 2016 simulation worlds and models to give us something to work off.

Download some 3D models for our simulation.

```
curl -o \
    $HOME/Downloads/models.zip \
    https://usfirst.collab.net/sf/frs/do/downloadFile/projects.wpilib/frs.simulation.frcsim_gazebo_models/frs1160?dl=1
```

Unzip the model files into our `$HOME/Downloads` directory.

```
unzip $HOME/Downloads/models.zip -d $HOME/Downloads/
```

Copy the downloaded gazebo simulation _models_ into our simulation directory.

```
cp -r $HOME/Downloads/frcsim-gazebo-models-4/models \
    $HOME/wpilib/simulation/
```

Copy the downloaded gazebo simulation _worlds_ into our simulation directory.

```
cp -r $HOME/Downloads/frcsim-gazebo-models-4/worlds \
    $HOME/wpilib/simulation/
```

Download the official 2016 game arena world file to our simulation directory.

```
curl -o $HOME/wpilib/simulation/worlds/frc2016.world \
    "http://first.wpi.edu/FRC/roborio/release/simulation/downloads/frc2016.world"
```

## Create a sample application

If you already have Java code for your robot in Eclipse, you can skip this step. This is to get you set up with some sample code to get started.

In Eclipse navigate to `File` -> `New` -> `Other` -> `WPILib Robot Java Development` -> `Example Robot Java Program`.

Enter your team number when prompted.

Choose the `GearsBot` sample from the bottom of the list in the `CommandBased Project` category. This is a simple sample robot that has a corresponding simulation model.

Click `Next` -> `Finish`.

## Run<a name="run"></a>

### 1. FRCSim/Gazebo

Fire up `frcsim` (Gazebo) using the terminal.

```
frcsim
```

That will load an empty three dimensional world in which we can test our robot.

**Alternatively**, you can specify a world file to be loaded like so. Here we are using the world from 2016. As I mentioned above, the 2017 world has not been released.

```
frcsim $HOME/wpilib/simulation/worlds/frc2016.world
```

Wait until Gazebo has finished loading. Once Gazebo loads, insert the sample `GearsBot` robot provided by FRC.

In Gazebo navigate to `Insert` -> `Models` -> `GearsBot`.

Click somewhere in the world to place your model.

### 2. Simulated driver station

Run the drive station simulator.

```
sim_ds
```

Select your input controller from the list provided. Select `Teleop`. Click `Enable`.

### 3. Run the code

Right click the name of your project in Eclipes and `Run As` a `WPILib Java Simulation`.

### 4. Enjoy

![Gazebo](/assets/frc-linux/gazebo.png)

You should now be able to use your controller to drive your robot.

## Next steps

Your next steps should be that you alter the code (or create a whole new project as needed) tailored to the needs of your robot.

You should also research (see docs below) how you can export a CAD model of _your_ robot, or create one from scratch, for use in Gazebo. **That is critical**, because then you can test _your_ robot in the Gazebo simulator world rather than the sample robot. Although, as noted in the warnings above, **I think this is extremely difficult and I have never been able to get it working.**

The sample robot may have motors and other physical components that do not align with the robot your team is building. Only by testing a model of _your_ robot can you ensure your code will work as expected.

The sample robot models in Gazebo may be helpful in testing things like the drivetrain, but this is **not a substitute for testing with your real physical robot**.

## Troubleshooting

### Robot is not moving

Make sure you completed all the above steps **in the specified order**.

1. Terminate your Eclipse simulation (the red square "Stop" button) if it is running.
1. Close Gazebo.
1. Close `sim_ds`.
1. Try re-running the [Run](#run) steps above **in the specified order**.

Make sure the "Pause" button is not selected in Gazebo (it is located at the bottom of the Gazebo window).

### Joystick/Controller

This command helps test raw controller input in linux.

```
jstest-gtk
```

### sim_ds will not stop

If `sim_ds` does not fully exit after closing its window, you can type `ctrl + c` in its terminal window to kill it.

### sim_ds will not connect

```
$ sim_ds
WARNING|Gazebo Transport: Cannot connect, retrying in five seconds.
WARNING|Gazebo Transport: Cannot connect, retrying in five seconds.
WARNING|Gazebo Transport: Cannot connect, retrying in five seconds.
WARNING|Gazebo Transport: Cannot connect, retrying in five seconds.
```

This most likely means Gazebo is not running. Make sure to start Gazebo _before_ starting `sim_ds`.

If it is still not working after you run Gazebo, close everything and try again. Remember, you must run the appropriate steps in the **specified order**.

### Error when running a script or installing software

```
E: Could not get lock /var/lib/dpkg/lock - open (11: Resource temporarily unavailable)
E: Unable to lock the administration directory (/var/lib/dpkg/), is another process using it?
```

This means that your machine is currently in the process of installing software. Do not reboot! Do not try to stop it!

There are two likely causes for that error.

1. Your machine is auto-updating in the background.
2. You are already in the middle of installing software.

In both cases, you should **be patient and wait**.

You can check the status of currently running software installs with this command.

```
ps ax | grep -i dpkg
```

### NVIDIA GPU

If using an NVIDIA GPU, you can install proprietary drivers, which should perform better than the stock drivers.

System Menu -> Settings -> Additional Drivers.

Let the process scan and list the proprietary drivers you require (choose the newest tested proprietary drivers for your card).

![nvidia](/assets/frc-linux/nvidia.png)

Click `Apply Changes`. Let the install finish. Then reboot.

## Docs

The [official docs for FRCSim](https://wpilib.screenstepslive.com/s/4485/m/23353) can be a tad confusing. The manual process is a bit out of date, and covers the 2016 models/worlds, but does not seem to have been updated for 2017. The official docs recommend a version of Ubuntu that is fairly old at this point.

That said, the official docs were my source material for this guide. I picked out the bits and pieces of the FRCSim install process that I needed, and tracked down the 2017 files where I could (and where they weren't referenced in the official docs).

* [FRC 2017 Overview](http://www.firstinspires.org/resource-library/frc/competition-manual-qa-system)
* [Programmer's Overview](https://wpilib.screenstepslive.com/s/4485)
* [WPILib JAVA API](http://first.wpi.edu/FRC/roborio/release/docs/java/)
* [Bootstrapping an FRC Java dev environment](https://wpilib.screenstepslive.com/s/4485/m/13809/l/599681-installing-eclipse-c-java)
* [Installing FRC Toolchains](http://first.wpi.edu/FRC/roborio/toolchains/)
* [Deploying code](https://wpilib.screenstepslive.com/s/4485/m/13809/l/242586-building-and-downloading-a-robot-project-to-the-roborio)
* [Creating a robot project in Eclipse](https://wpilib.screenstepslive.com/s/4485/m/13809/l/145307-creating-your-benchtop-test-program)
* [Using the robot builder to generate stub code for motors, servos, etc.](https://wpilib.screenstepslive.com/s/4485/m/26402/c/92710)
* [Exporing robot models from CAD using solidworks](https://wpilib.screenstepslive.com/s/4485/m/23353/l/349023-installing-solidworks-gazebo-exporter-plugin)
* [Importing robot models into gazebo](https://wpilib.screenstepslive.com/s/4485/m/23353/l/403034-importing-a-model-into-gazebo)
* [Simulating gearsbot demo](https://wpilib.screenstepslive.com/s/4485/m/23353/l/228980-simulating-gearsbot-with-frcsim)
* [Overview of robot builder](https://wpilib.screenstepslive.com/s/4485/m/26402/l/255426-overview-of-robotbuilder)
* [Creating robot models _without_ SolidWords & CAD](http://wpilib.screenstepslive.com/s/4485/m/23353/l/482129-debugging-simulation)
* [Troubleshooting gazebo 7, wpilib, and Ubuntu 16](https://www.chiefdelphi.com/forums/showthread.php?t=152866)
* [Java RobotDrive examples: Tank Drive, Arcade Drive, Mecanum drive](http://wpilib.screenstepslive.com/s/4485/m/13809/l/599700-getting-your-robot-to-drive-with-the-robotdrive-class)
* [Runtime error while running java simulation of GearBots sample](https://github.com/wpilibsuite/allwpilib/issues/456) -->
