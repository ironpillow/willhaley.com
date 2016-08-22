---
title: "Printing in Arch Linux"
slug: printing-in-arch-linux
date: 2017-02-04 16:09:00
---

I had added my user to the group `lp`, but still got this error when trying to list printers.

```
$ lpinfo -v
lpinfo: Forbidden
```

I found that the key was [in this post on the Arch Linux Forums](https://bbs.archlinux.org/viewtopic.php?pid=376974#p376974).

```
sudo groupadd printadmin
sudo usermod -a -G printadmin $USER
```

Then I had to edit `/etc/cups/cups-files.conf` and change the following.

```
SystemGroup sys root
```

to

```
SystemGroup printadmin root
```

Once I did that and rebooted, I was able to see output from `lpinfo -v` without needing root access.

```
$ lpinfo -v
network http
network beh
network lpd
network socket
network ipp
network ipps
network https
direct hp:/usb/Photosmart_D110_series?serial=CN0CAG436D05N9
direct usb://HP/Photosmart%20D110%20series?serial=CN0CAG436D05N9&interface=1
direct hpfax
```

At this point, I could use the `System` -> `Administration` -> `Print Settings` in `MATE` to add my printer.

Done!
