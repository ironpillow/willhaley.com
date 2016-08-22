---
title: "Find and Correspond Which Disk Belongs to Which Hard Drive Controller in Linux"
slug: find-correspond-disk-belongs-which-hard-drive-controller-linux
date: 2016-09-21 22:07:31
---

First, list all block devices with an identifier for their PCI device.

```
ls -al /sys/block/sd*
lrwxrwxrwx 1 root root 0 Sep  6 10:01 /sys/block/sda -> ../devices/pci0000:00/0000:00:1f.2/ata3/host2/target2:0:0/2:0:0:0/block/sda
lrwxrwxrwx 1 root root 0 Sep  6 10:01 /sys/block/sdb -> ../devices/pci0000:00/0000:00:1f.2/ata3/host2/target2:0:1/2:0:1:0/block/sdb
lrwxrwxrwx 1 root root 0 Sep  6 10:01 /sys/block/sdc -> ../devices/pci0000:00/0000:00:1f.2/ata4/host3/target3:0:0/3:0:0:0/block/sdc
lrwxrwxrwx 1 root root 0 Sep  6 10:01 /sys/block/sdd -> ../devices/pci0000:00/0000:00:1f.2/ata4/host3/target3:0:1/3:0:1:0/block/sdd
lrwxrwxrwx 1 root root 0 Sep  6 10:01 /sys/block/sde -> ../devices/pci0000:00/0000:00:1e.0/0000:05:05.0/ata5/host4/target4:0:0/4:0:0:0/block/sde
lrwxrwxrwx 1 root root 0 Sep  6 10:04 /sys/block/sdf -> ../devices/pci0000:00/0000:00:1e.0/0000:05:05.0/ata8/host7/target7:0:0/7:0:0:0/block/sdf
```

Note above that several disks are attached to `pci0000:00/0000:00:1f.2`.

So what does that get us? Well, if you run `lspci` with no arguments, you will realize that the PCI ids listed by `lspci` correspond to the PCI ids output by the `ls` command above.

The qualifying aspect here is `1f.2`. Let's use `lspci` to determine which controller that is.

```
lspci | grep -i 1f.2
00:1f.2 IDE interface: Intel Corporation NM10/ICH7 Family SATA Controller [IDE mode] (rev 01)
```

Ah, yes. I know that the Intel SATA controller would be the one on my motherboard, as opposed to the secondary SATA card I have installed.

What about the disks connected to `pci0000:00/0000:00:1e.0`? That should be my secondary SATA card, right?

Let's run the same `lspci` command above, but using `1e.0` to confirm.

```
lspci | grep -i 1e.0
00:1e.0 PCI bridge: Intel Corporation 82801 PCI Bridge (rev e1)
```

`PCI Bridge`. Ah, that's showing us the `lspci` entry for the PCI bridge itself, now for the SATA controller.

Let's look at the original output of `ls -al /sys/block/sd*` again.

There is a bit more specificity after `pci0000:00/0000:00:1e.0`. Note the last bit after the last `/` here.  `pci0000:00/0000:00:1e.0/0000:05:05.0`. Let's search for that last qualifier.

```
lspci | grep -i 05.0
05:05.0 RAID bus controller: Silicon Image, Inc. SiI 3114 [SATALink/SATARaid] Serial ATA Controller (rev 02)
```

There we go! That's the other SATA controller.

This will allow us to se all disks connected to that secondary SATA controller.

```
ls -al /sys/block/sd* | grep -i '05:05.0'

lrwxrwxrwx 1 root root 0 Sep  6 10:20 /sys/block/sde -> ../devices/pci0000:00/0000:00:1e.0/0000:05:05.0/ata5/host4/target4:0:0/4:0:0:0/block/sde
lrwxrwxrwx 1 root root 0 Sep  6 10:20 /sys/block/sdf -> ../devices/pci0000:00/0000:00:1e.0/0000:05:05.0/ata8/host7/target7:0:0/7:0:0:0/block/sdf
```

`sde` and `sdf` are the two disks on that controller. Good to know!

You can see how, based on a name like `SiI 3114`, you could find all devices. First, get the PCI id with `lspci`, then use the other commands to get the devices.
