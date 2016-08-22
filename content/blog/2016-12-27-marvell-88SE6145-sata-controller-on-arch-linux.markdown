---
title: "Marvell 88SE6145 SATA Controller on Arch Linux"
slug: marvell-88SE6145-sata-controller-on-arch-linux
date: 2016-12-27 13:38:25
---

My instructions are based on [this article](https://bbs.archlinux.org/viewtopic.php?id=105653) for getting Arch to support the 88SE6145 SATA II PCI-E Marvell controller. That is one of two SATA controllers used by the Intel BOXD975XBX2KR LGA 775 Intel 975X ATX Intel Motherboard.

<!-- more -->

Here is what we must do.

Blacklist the Marvell PATA kernel module.

```
# /etc/rc.conf
MODULES=(... !pata_marvell)
```

Enable Marvell AHCI module.

```
# /etc/modprobe.d/modprobe.conf
options ahci marvell_enable=1
```

Update ramdisk config.

```
# /etc/mkinitcpio.conf
MODULES="ahci"
...
FILES="/etc/modprobe.d/modprobe.conf"
```

Recreate ramdisk.

```
mkinitcpio -p linux
```

Done!
