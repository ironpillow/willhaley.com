---
title: "Create a Custom Debian 8 (Jessie) Live Environment (CD or USB) using Ubuntu 16.04.2 (Xenial)"
date: 2017-02-20 11:28:00
published: false
---

These are steps that I used on an **Ubuntu 16.04.2 LTS (Xenial Xerus)** 64-bit system to build an **x86 Debian 8 (Jessie)** live environment that I can boot from CD or USB

<!-- more -->

**<span class="warning">Warning</span>**: I have **<span class="warning">highlighted</span>** all the places you should be in the chroot environment. Be careful! Running some of these commands on your local environment instead of in the chroot can cause issues.

1. Install applications we need to build the environment.

    ```
    sudo apt-get install \
        debootstrap syslinux isolinux squashfs-tools \
        genisoimage memtest86+ rsync
    ```

1. Set up the base Debian environment. I am using Jessie for my distribution and i386 for the architecture. Please change your mirror if you are not in the U.S. or know of a mirror close to you.

    ```
    # Create a directory for the live environment.
    mkdir $HOME/live_boot
    ```

    ```
    sudo debootstrap \
        --arch=i386 \
        --variant=minbase \
        jessie $HOME/live_boot/chroot http://ftp.us.debian.org/debian/
    ```

1. Chroot to our Debian environment.

    ```
    sudo chroot $HOME/live_boot/chroot
    ```

1. **<span class="warning">chroot</span>**

    Set a custom hostname for your Debian environment.

    ```
    echo "debian-live" > /etc/hostname
    ```

1. **<span class="warning">chroot</span>**

    Figure out which Linux Kernel you want in your live environment.

    ```
    apt-cache search linux-image
    ```

1. **<span class="warning">chroot</span>**

    I chose the 3.16.0-4-586 linux image. I also believe live-boot is required. Everything else was a program of my choosing.

    ```
    apt-get update && \
	apt-get install --no-install-recommends --yes --force-yes \
        linux-image-3.16.0-4-586 live-boot \
        network-manager net-tools wireless-tools wpagui \
        tcpdump wget openssh-client \
        blackbox xserver-xorg-core xserver-xorg xinit xterm \
        pciutils usbutils gparted ntfs-3g hfsprogs rsync dosfstools \
        syslinux partclone nano pv \
        rtorrent iceweasel chntpw && \
	apt-get clean
    ```

1. **<span class="warning">chroot</span>**

    Set the root password (my only user will be root in the live environment)

    ```
    passwd root
    ```

1. **<span class="warning">chroot</span>**

    ```
    exit
    ```

1. Make directories that will be copied to our bootable medium.

    ```
    mkdir -p $HOME/live_boot/image/{live,isolinux}
    ```

1. Compress the chroot environment into a Squash filesystem.

    ```
	(cd $HOME/live_boot && \
		sudo mksquashfs chroot image/live/filesystem.squashfs -e boot
	)
    ```

1. Prepare our USB/CD bootloader. You should be able to copy and paste these lines into a terminal to save you some time.

    ```
	(cd $HOME/live_boot && \
		cp chroot/boot/vmlinuz-3.16.0-4-586 image/live/vmlinuz1
		cp chroot/boot/initrd.img-3.16.0-4-586 image/live/initrd1
	)
    ```

1. Create a menu for the isolinux bootloader. Create a text file at `$HOME/live_boot/image/isolinux/isolinux.cfg` with this content.

    ```
    UI menu.c32

    prompt 0
    menu title Debian Live

    timeout 300

    label Debian Live 3.16.0-4-586
    menu label ^Debian Live 3.16.0-4-586
    menu default
    kernel /live/vmlinuz1
    append initrd=/live/initrd1 boot=live

    label hdt
    menu label ^Hardware Detection Tool (HDT)
    kernel hdt.c32
    text help
    HDT displays low-level information about the systems hardware.
    endtext

    label memtest86+
    menu label ^Memory Failure Detection (memtest86+)
    kernel /live/memtest
    ```

# Create a bootable medium

## CD

Copy files necessary for the ISO to boot and then create the ISO

```
(cd $HOME/live_boot/image/ && \
	cp /usr/lib/ISOLINUX/isolinux.bin isolinux/ && \
	cp /usr/lib/syslinux/modules/bios/menu.c32 isolinux/ && \
	cp /usr/lib/syslinux/modules/bios/hdt.c32 isolinux/ && \
	cp /usr/lib/syslinux/modules/bios/ldlinux.c32 isolinux/ && \
	cp /usr/lib/syslinux/modules/bios/libutil.c32 isolinux/ && \
	cp /usr/lib/syslinux/modules/bios/libmenu.c32 isolinux/ && \
	cp /usr/lib/syslinux/modules/bios/libcom32.c32 isolinux/ && \
	cp /usr/lib/syslinux/modules/bios/libgpl.c32 isolinux/ && \
	cp /usr/share/misc/pci.ids isolinux/ && \
	cp /boot/memtest86+.bin live/memtest
)
```

```
genisoimage \
    -rational-rock \
    -volid "Debian Live" \
    -cache-inodes \
    -joliet \
    -hfs \
    -full-iso9660-filenames \
    -b isolinux/isolinux.bin \
    -c isolinux/boot.cat \
    -no-emul-boot \
    -boot-load-size 4 \
    -boot-info-table \
    -output $HOME/live_boot/debian-live.iso \
    $HOME/live_boot/image
```

Now burn the ISO to a CD and you should be ready to boot from it and go.

## USB

Copy files necessary for the USB to boot and copy the environment to the USB drive (I am assuming you have an umounted **FAT32** formatted USB drive **/dev/sdf** and the **BOOT** flag is set on /dev/sdf1 and you have a ready mount point at **/mnt/usb**)

```
sudo syslinux -i /dev/sdf1
sudo dd \
    if=/usr/lib/syslinux/mbr/mbr.bin \
    of=/dev/sdf \
    conv=notrunc bs=440 count=1
sudo mount /dev/sdf1 /mnt/usb
```

You should be able to copy and paste this block into a terminal to save you some time.

```
sudo cp /usr/lib/syslinux/modules/bios/menu.c32 /mnt/usb/ && \
sudo cp /usr/lib/syslinux/modules/bios/hdt.c32 /mnt/usb/ && \
sudo cp /usr/lib/syslinux/modules/bios/ldlinux.c32 /mnt/usb/ && \
sudo cp /usr/lib/syslinux/modules/bios/libutil.c32 /mnt/usb/ && \
sudo cp /usr/lib/syslinux/modules/bios/libmenu.c32 /mnt/usb/ && \
sudo cp /usr/lib/syslinux/modules/bios/libcom32.c32 /mnt/usb/ && \
sudo cp /usr/lib/syslinux/modules/bios/libgpl.c32 /mnt/usb/ && \
sudo cp /boot/memtest86+.bin /mnt/usb/memtest && \
sudo cp $HOME/live_boot/image/isolinux/isolinux.cfg /mnt/usb/syslinux.cfg && \
sudo cp /usr/share/misc/pci.ids /mnt/usb/ && \
sudo rsync -rv $HOME/live_boot/image/live /mnt/usb/
```

Now unmount the drive and you should be ready to boot from it and go.

# Citations

* [LiveCDCustomizationFromScratch](https://help.ubuntu.com/community/LiveCDCustomizationFromScratch)
* [Debian Current live-build Manual](http://live.debian.net/manual/current/html/live-manual.en.html)
* [Syslinux How Tos](http://www.syslinux.org/wiki/index.php/HowTos)
* [Syslinux Common Problems: Missing Operating System](http://www.syslinux.org/wiki/index.php/Common_Problems#Missing_Operating_System_.28mbr.bin.29)
* [Ubuntu Precise live-build man page](http://manpages.ubuntu.com/manpages/precise/man7/live-build.7.html)
