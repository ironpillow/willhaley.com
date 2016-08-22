---
title: "FRC roboRIO Images, Firmware, and Update Suites"
date: 2018-02-22 20:05:00
---

I find the distinction between the **roboRIO image** and the **roboRIO firmware** is unclear when reading the FRC documentation. The terms `image` and `firmware` are used interchangably in some industries and contexts, and even the FRC guides seem to overlap the terms `imaging` and `image` in relation to `firmware`.

After hours of troubleshooting some bugs, our team learned quite a bit about the processes involved with, and the distinctions between, the roboRIO image and firmware. Hopefully our findings will prove helpful.

# [Image](https://wpilib.screenstepslive.com/s/currentCS/m/getting_started/l/144984-imaging-your-roborio)

The roboRIO image is a compressed Linux filesystem. It is an image of an armv7 Linux operating system (OS) designed to run on the roboRIO.

As an analogy, the roboRIO image is very similar to a Raspberry Pi image, if you are familiar with that platform.

_It is likely you **may need to update** the image on your roboRIO from year to year._

# [Firmware](https://wpilib.screenstepslive.com/s/4485/m/24193/l/273817-updating-your-roborio-firmware)

The firmware is a low-level bit of software for the roboRIO. It includes the bootloader.

> Note that the firmware is separate from the roboRIO image. You will need to update your roboRIO firmware once after receiving the roboRIO and should only need to do so again if instructed specifically by an update.

_You should **rarely, if ever, need to update** the firmware._

# Version Number Inconsistency

The version numbers of the roboRIO images and roboRIO firmwares do not seem to align well with the versions of the [Eclipse plugins](http://first.wpi.edu/FRC/roborio/release/), [FRC toolchains](http://first.wpi.edu/FRC/roborio/toolchains/), [wpilib](https://github.com/wpilibsuite/allwpilib/releases), and LabView software. The varying version numbers can be confusing.

For example, as of time of writing, these are the latest versions for competition year 2018.

* Eclipse plugins - `V2018.3.3`
* wpilib - `v2018.3.3`
* roboRIO image - `FRC_roboRIO_2018_v17`
* roboRIO firmware - `roboRIO_5.0.0`
* LabView - `LabVIEW 2017`

# FRC Update Suites

You may find the need to install multiple update suites on your machine if you decide you need to **downgrade** or **upgrade** the image on your roboRIO while troubleshooting.

Various roboRIO images and roboRIO firmware versions are installed via the various National Instruments FRC Update Suites.

**Note that it _seems_ safe to install multiple update suite versions side by side if needed, but do this at your own risk.**

# FRC Competition Year 2018 Update Suite

[FRC 2018 Update Suite (FRCLabVIEWUpdate2018.1.0)](http://www.ni.com/download/first-robotics-software-2015/5112/en/)

This update suite will create a `LabVIEW 2017` directory, despite being for the `2018` competition year.

```
C:\Program Files (x86)\National Instruments\LabVIEW 2017
```

This FRC Update Suite includes these versions of the firmware and image for the roboRIO.

* **Firmware:** `roboRIO_5.0.0`
* **Image:** `FRC_roboRIO_2018_v17` (`Image 2018 version 17`)
* **FRC roboRIO Imaging Tool** `Version 18.0`

# FRC Competition Year 2017 Update Suite

[FRC 2017 Update Suite (FRCLabVIEWUpdate2017.2.0)](http://www.ni.com/download/first-robotics-software-2017/6492/en)

This update suite will create a `LabVIEW 2016` directory, despite being for the `2017` competition year.

```
C:\Program Files (x86)\National Instruments\LabVIEW 2016
```

This FRC Update Suite includes these versions of the firmware and image for the roboRIO.

* **Firmware:** `roboRIO_3.0.0f0`
* **Image:** `FRC_roboRIO_2017_v8` (`Image 2017 version 8`)
* **FRC roboRIO Imaging Tool** `Version 17.0a24`

# [Flash roboRIO Image](https://wpilib.screenstepslive.com/s/currentCS/m/getting_started/l/144984-imaging-your-roborio)

Note that **the version of the FRC roboRIO Imaging Tool you use will determine which image is installed to the robot**.

These two different imaging tools are responsible for their respective images. See above to determine which version you may like to use.

```
C:\Program Files (x86)\National Instruments\LabVIEW 2016\project\roboRIO Tool\roboRIO_ImagingTool.exe
C:\Program Files (x86)\National Instruments\LabVIEW 2017\project\roboRIO Tool\roboRIO_ImagingTool.exe
```

Check the `Format Target` box, verify the image listed in `Select Image` is what you want.

Click `Reformat` and wait.

You may need to [install Java to your roboRIO]({{<relref "frc-roborio-java.markdown" >}}) after the formatting is complete.

# [Flash roboRIO Firmware](https://wpilib.screenstepslive.com/s/4485/m/24193/l/273817-updating-your-roborio-firmware)

You can follow the [FRC instructions](https://wpilib.screenstepslive.com/s/4485/m/24193/l/273817-updating-your-roborio-firmware) for this, but I will also, roughly, outline the process here.

As an anology, the firmware uploading process is very similar to how you might manually update the firmware on a WiFi router.

Navigate to `http://172.22.11.2` in your browser, and ensure you are connected to the roboRIO via USB.

> Note: The roboRIO should only be firmware flashed via the USB connection. Do not update via the Ethernet connection.

> Make sure that nothing (including the radio) is connected to the Ethernet port when updating the roboRIO firmware.

Note that you **must** use Internet Explorer (included with Windows 10) and **not** Edge (also included with Windows 10) as your browser when flashing the roboRIO firmware. This is because the roboRIO web interface requires [Silverlight](https://www.microsoft.com/silverlight/).

Depending on which version(s) of the FRC Update Suite(s) you installed, you should see different firmware files here that can be uploaded to your roboRIO.

```
C:\Program Files (x86)\National Instruments\Shared\Firmware\cRIO\76F2
```

If you installed the 2018 FRC Update Suite, you should see the `roboRIO_5.0.0.cfg` file in that directory.

If you installed the 2017 FRC Update Suite, you should see the `roboRIO_3.0.0f0.cfg` file in that directory.

If you installed both update suites, then _both_ firmware files should be present in the `76F2` directory.

Again, you **probably do not need to update the firmware unless explicitly notified**.

# Citations

* http://khengineering.github.io/RoboRio/faq/roborio/
* http://www.ni.com/download/first-robotics-software-2017/6492/en/
* https://www.chiefdelphi.com/forums/showthread.php?t=153472
* http://www.ni.com/download/first-robotics-software-2017/6492/en/
