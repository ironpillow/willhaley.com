---
title: "EXTLINUX Menu Customization"
slug: extlinux-menu
date: 2017-10-19 23:25:00
---

[EXTLINUX](http://www.syslinux.org/wiki/index.php?title=EXTLINUX) is neat.

> EXTLINUX is a Syslinux variant which boots from a Linux filesystem

It provides (as far as I can tell) all the functionality of SYSLINUX with the [bonus that you can boot from these filesystems](http://www.syslinux.org/wiki/index.php?title=EXTLINUX).

`FAT12/16/32, NTFS, ext2/3/4, Btrfs, XFS, UFS/FFS`

If you have an `ext4` formatted disk with the `bootable` flag enabled on the parition, you can do the following to set up a fun custom boot menu.

![screenshot.png](/images/extlinux-menu/screenshot.png)

_I am assuming extlinux/syslinux is installed to `/usr/lib/syslinux`, as it was for me on Ubuntu 16.04.3, and that your disk is at `/dev/sdz`_

Copy the `mbr` to your disk's boot sector.

```
sudo dd \
	if=/usr/lib/syslinux/mbr/mbr.bin \
	of=/dev/sdz \
	count=1 \
	bs=440 \
	conv=notrunc
```

Mount your device at `/mnt`.

```
sudo mount /dev/sdz1 /mnt
```

Install `extlinux` to your mounted disk.

```
sudo extlinux --install /mnt
```

Your disk should look something like this.

```
$ ls /mnt/
ldlinux.c32  ldlinux.sys  lost+found
```

Copy the following files from `/usr/lib/syslinux/modules/bios/` to `/mnt/`.

```
vesamenu.c32
libcom32.c32
libutil.c32
```

Copy [an image](/images/extlinux-menu/background.png) ([original](https://static.pexels.com/photos/110854/pexels-photo-110854.jpeg)) that is _exactly_ 640x480 to `/mnt/background.png`.

```
sudo cp ~/some/image/image-640x480.png /mnt/background.png
```

Create a file at `/mnt/extlinux.conf` that looks like this. Note that I have put _placeholder_ boot entries here. You need to install the files needed to boot to Linux or some other distribution. This menu is valid, but without the files, you cannot boot anything.

```
UI vesamenu.c32

MENU TITLE Boot Menu

# This corresponds to a label below.
DEFAULT linux

# Timeout is measured in 1/10 of a second.
# 600 -> 60 seconds.
# Timeout is ignored if only one menu entry.
TIMEOUT 600

# Background image *must* be the same resolution as the resolution here.
MENU RESOLUTION 640 480
MENU BACKGROUND background.png

# White on a black/transparent background.
MENU COLOR screen * #ffffffff #00000000 std

# Blue borders on a black/transparent background.
# Borders have padding, so that background matters.
MENU COLOR border * #ff0000ff #00000000 std

# Title bar is cyan on a black/transparent background.
MENU COLOR title * #ff00ffff #00000000 std

# Selection bar is white on a magenta/opaque background.
MENU COLOR sel * #ffffffff #ffff00ff none

# Unselected menu items are white on black/transparent.
MENU COLOR unsel * #ffffffff #00000000 std

LABEL linux
  MENU LABEL Some Linux Entry
  MENU DEFAULT
  KERNEL /vmlinuz
  APPEND initrd=/initrd.gz
  TEXT HELP
    Boot Linux
  ENDTEXT

LABEL memtest
  MENU LABEL MemTest86+
  KERNEL /memtest
  TEXT HELP
    Boot MemTest86+ memory test application
  ENDTEXT
```
