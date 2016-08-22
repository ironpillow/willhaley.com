---
title: "Create a Simple Spanned LVM Volume"
slug: simple-lvm-spanned-volume
date: 2016-09-01 18:15:02
---

Start with one drive. Create a spanned volume, volume group, and logical volume.

```
pvcreate /dev/sdb
vgcreate STORAGE1 /dev/sdb
lvcreate -l +100%FREE STORAGE1 -n storage1
```

Add an additional disk (you could have done this in one step, but I want to illustrate adding a disk).

```
pvcreate /dev/sdc
vgextend STORAGE1 /dev/sdc
lvextend -l +100%FREE /dev/STORAGE1/storage1
```

You can view the status of the physical and logical volumes.

```
pvdisplay
vgdisplay
lvdisplay
```
