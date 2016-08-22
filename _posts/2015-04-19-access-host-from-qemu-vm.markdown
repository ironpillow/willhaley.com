---
layout: post
title: "Access Host from QEMU VM"
date: 2015-04-19 13:50:27 -0500
comments: true
categories:
---

From within a QEMU VM, you can access the host at `10.0.2.2`.

This info is not widely publicized, but is extremely helpful for sharing data back and forth between the guest and host without any plugins or jumping through a lot of hoops (short of having the active share and some kind of SMB client in the guest).

Here's an example where I can access my Windows 7 User share from within a Linux guest.

```
sudo mount.cifs //10.0.2.2/Users/Will/ /mnt/will -o user=will,pass=password
```

