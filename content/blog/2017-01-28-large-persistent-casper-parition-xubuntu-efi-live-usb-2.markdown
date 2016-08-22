---
title: "Large Persistent Casper Partition on an Ubuntu EFI Live USB"
slug: large-persistent-casper-parition-xubuntu-efi-live-usb-2
date: 2017-01-28 21:55:00
---

[YUMI](https://www.pendrivelinux.com/yumi-multiboot-usb-creator/) and [UNetbootin](https://unetbootin.github.io/) are both very user-friendly and simple applications for creating bootable USB drives with persistence. **I highly recommend trying those first** if you want persistence. They are very helpful and may do exactly what you need with much less effort.

If those options do not suit your needs, then [mkusb might fit the bill](https://askubuntu.com/questions/772744/how-to-make-a-live-usb-persistent).

First, get access to an Ubuntu based machine and install `mkusb`.

```
sudo apt-get update
sudo add-apt-repository ppa:mkusb/ppa
sudo apt-get update
```

Connect your target flash drive on which you want Xubuntu with persistence

I find the UI and syntax for `mkusb` a bit hectic, but I must admit, it is the only reliable solution I have found (more on this below).

Run `mkusb`.

```
sudo -H mkusb-11 ~/xubuntu.iso p
```

When prompted, choose your target USB drive.

Follow the prompts.

Choose `GPT` for the partition table, and use `100` for the size of the persistence.

Once done, your drive should be bootable. Congratulations. Your USB should now be bootable on BIOS and EFI systems, which means both PCs and Macs. The USB drive should have persistence as well so that your changes will be saved between reboots.

# Other options

It is worth pointing out that you can simply `dd` a Xubuntu (or any modern Ubuntu) `iso` image to a flash drive if you simply want a bootable USB drive without persistence.

Unfortunately, there is a [known bug](https://bugs.launchpad.net/ubuntu/+source/casper/+bug/1489855) around using persistence partitions for Ubuntu-based live USBs. The bug seems to come and go between releases, and is currently an issue in the 16.04.1 image. [Creating and using a persistent partition](https://www.pendrivelinux.com/create-a-larger-than-4gb-casper-partition/) _should_ be a simple process, but that Ubuntu persistence bug complicates things.

The bug prevents the live USB from properly using the `casper-rw` partition. The bug makes it so that only the `casper-rw` _file_ will mount properly, and not the `casper-rw` _partition_. It is very annoying and hard to debug. There are [some workarounds](https://askubuntu.com/questions/664577/unable-to-boot-ubuntu-live-usb-flash-drive-with-casper-rw-persistent-partition), but I decided to choose another implementation instead of implementing them.

A strike against YUMI and UNetbootin is that they are limited to 4 GB since that is a hard limit on `fat32` filesystem file sizes. YUMI and UNetbootin both simply use a file for the persistent storage so they are affected by that limit. `mkusb` uses a partition and so is not limited in the same way.
