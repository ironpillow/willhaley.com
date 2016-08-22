---
title: "Securely erase a disk in the terminal in OS X El Capitan"
slug: securely-erase-a-disk-in-the-terminal-in-os-x-el-capitan
date: 2016-02-07 12:05:42
---

It took me longer than I'd like to admit to learn how to use the `secureErase` command to shred a disk using diskutil in OS X El Capitan.

```
# This works, using one pass of random data.
# Replace `disk3` with whatever you need!
diskutil secureErase 1 /dev/disk3
```

<!-- more -->

I found the documentation for the command slightly confusing.

```
diskutil secureErase [freespace] level MountPoint|DiskIdentifier|DeviceNode
```

I'm not used to a whole parameter being optional. It turns out that you either use the `freespace` flag, or you omit it completely, and that's what the `[]` around it indicate.

So if you would like to wipe a disk entirely, including free space, simply omit `freespace` from your command.
