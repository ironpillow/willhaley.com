---
title: "Install android apps to SD card by default"
slug: install-android-apps-to-sd-card-by-default
date: 2015-01-09 22:47:44
---

There's a bit of a bad user experience when you run out of space to install new apps on your Android device.  You may want to move newly installed apps to your SD card to free up space on-device, but you can't download any apps in the first place if your device does not have sufficient storage space in the default installation location.

To get Android to install to your SD card by *default*, you can use the following command.

```
pm set-install-location 2
```

<!-- more -->

In order for this to work, you will need to use adb to connect to your device and issue commands.  There are [many](http://lifehacker.com/the-easiest-way-to-install-androids-adb-and-fastboot-to-1586992378) [tutorials](http://www.howtogeek.com/125769/how-to-install-and-use-abd-the-android-debug-bridge-utility/) online that explain how to install and [use adb](http://developer.android.com/tools/help/adb.html).

You can use this command to see what setting your device is currently using for install location, and what options are available.

```
pm get-install-location
```

Make sure you have an SD card inserted, with available space, before doing this.  If not, then this will not work, and the error messages from your device will not be very clear in explaining what the issue is.

You may not have to reboot your device, but I found that I did.

After a reboot, all new app installations on my device default to the SD card.
