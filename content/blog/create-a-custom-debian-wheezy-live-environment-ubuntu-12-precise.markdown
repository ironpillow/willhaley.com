---
title: "Create a Custom Debian 7 (Wheezy) Live Environment (CD or USB) using Ubuntu 12.04 (Precise)"
date: 2013-01-31 23:06:00
lastmod: 2017-02-20 11:28:00
published: false
---

These are steps that I used on an **Ubuntu 12.04 (precise)** 64-bit system to build an **i386 Debian 7 (Wheezy)** live environment that I can boot from CD or USB

<!-- more -->

**<span class="warning">Warning</span>**: I have **<span class="warning">highlighted</span>** all the places you should be in the chroot environment.  You should be in chroot for steps 5 - 10.  I will leave it to you to figure out that you are in the right environment.  The hostname of your chroot will be the same as your local machine by default so don't rely on hostname to be sure which environment you are in.  Be careful!  Running some of these commands on your local environment instead of in the chroot can cause issues.

You should also be careful about deleting the chroot and your working folder.  Make sure you unmount all mounted file systems before trying to delete anything.

1. Install applications we need to build the environment.

    ```
    sudo apt-get install \
        debootstrap \
        syslinux \
        squashfs-tools \
        genisoimage \
        memtest86+ \
        rsync
    ```

1. Setup the base Debian environment.  I am using wheezy for my distribution and i386 for the architecture.  Please do change your mirror if you are not in the U.S. or know of a mirror close to you.

    ```
    #use a separate directory for the live environment
    mkdir live_boot && cd live_boot
    ```

    ```
    sudo debootstrap --arch=i386 --variant=minbase wheezy chroot http://ftp.us.debian.org/debian/
    ```

1. A couple of important steps before we chroot.

    ```
    sudo mount -o bind /dev chroot/dev && sudo cp /etc/resolv.conf chroot/etc/resolv.conf
    ```

1. Chroot to our Debian environment.

    ```
    sudo chroot chroot
    ```

1. **<span class="warning">chroot</span>**

    Set a few required variables and system settings in our Debian environment. You should be able to copy and paste this whole block into a terminal to save you some time.

    ```
    mount none -t proc /proc && \
    mount none -t sysfs /sys && \
    mount none -t devpts /dev/pts && \
    export HOME=/root && \
    export LC_ALL=C && \
    apt-get update && \
    apt-get install dialog dbus --yes --force-yes && \
    dbus-uuidgen > /var/lib/dbus/machine-id
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

    I chose the 3.2.0-4-486 Kernel.  I also believe live-boot is required.  Everything else was a program of my choosing.

    ```
    apt-get install --no-install-recommends --yes \
    linux-image-3.2.0-4-486 live-boot \
    network-manager net-tools wireless-tools wpagui tcpdump wget openssh-client \
    blackbox xserver-xorg-core xserver-xorg xinit xterm \
    pciutils usbutils gparted ntfsprogs hfsprogs rsync dosfstools syslinux partclone nano pv \
    rtorrent iceweasel chntpw
    ```

1. **<span class="warning">chroot</span>**

    Set the root password (my only user will be root in the live environment)

    ```
    passwd root
    ```

1. **<span class="warning">chroot</span>**

    Clean up our Debian environment before leaving. You should be able to copy and paste this whole block into a terminal to save you some time.

    ```
    rm -f /var/lib/dbus/machine-id && \
    apt-get clean && \
    rm -rf /tmp/* && \
    rm /etc/resolv.conf && \
    umount -lf /proc && \
    umount -lf /sys && \
    umount -lf /dev/pts
    ```

    ```
    exit
    ```

1. Unmount dev from the chroot

    ```
    sudo umount -lf chroot/dev
    ```

1. Make directories that will be copied to our bootable medium.

    ```
    mkdir -p image/{live,isolinux}
    ```

1. Compress the chroot environment into a Squash filesystem.

    ```
    sudo mksquashfs chroot image/live/filesystem.squashfs -e boot
    ```

1. Prepare our USB/CD bootloader. You should be able to copy and paste these lines into a terminal to save you some time.

    ```
    cp chroot/boot/vmlinuz-3.2.0-4-486 image/live/vmlinuz1 && \
    cp chroot/boot/initrd.img-3.2.0-4-486 image/live/initrd1
    ```

1. Create a menu for the isolinux bootloader. Create a text file at image/isolinux/isolinux.cfg with this content.

    ```
    UI menu.c32

    prompt 0
    menu title Debian Live

    timeout 300

    label Debian Live 3.2.0-4-486
    menu label ^Debian Live 3.2.0-4-486
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
cp /usr/lib/syslinux/isolinux.bin image/isolinux/ && \
cp /usr/lib/syslinux/menu.c32 image/isolinux/ && \
cp /usr/lib/syslinux/hdt.c32 image/isolinux/ && \
cp /usr/share/misc/pci.ids image/isolinux/ && \
cp /boot/memtest86+.bin image/live/memtest
```

```
cd image && genisoimage -rational-rock -volid "Debian Live" -cache-inodes -joliet -full-iso9660-filenames -b isolinux/isolinux.bin -c isolinux/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table -output ../debian-live.iso . && cd ..
```

Now burn the ISO to a CD and you should be ready to boot from it and go.

## USB

Copy files necessary for the USB to boot and copy the environment to the USB drive (I am assuming you have an umounted **FAT32** formatted USB drive **/dev/sdf** and the **BOOT** flag is set on /dev/sdf1 and you have a ready mount point at **/mnt/usb**)

```
sudo syslinux -i /dev/sdf1
sudo dd if=/usr/lib/syslinux/mbr.bin of=/dev/sdf conv=notrunc bs=440 count=1
sudo mount /dev/sdf1 /mnt/usb
```

You should be able to copy and paste this block into a terminal to save you some time.

```
sudo cp /usr/lib/syslinux/menu.c32 /mnt/usb/ && \
sudo cp /usr/lib/syslinux/hdt.c32 /mnt/usb/ && \
sudo cp /boot/memtest86+.bin /mnt/usb/memtest && \
sudo cp image/isolinux/isolinux.cfg /mnt/usb/syslinux.cfg && \
sudo cp /usr/share/misc/pci.ids /mnt/usb/ && \
sudo rsync -rv image/live /mnt/usb/
```

Now unmount the drive and you should be ready to boot from it and go.

The goal of these steps and my work were to make a relatively small Linux live environment with applications that I often need when live booting.  You can adapt these steps to customize your environment however you like.  The man page for debootstrap is a helpful resource.

I also used these guides for help
[LiveCDCustomizationFromScratch](https://help.ubuntu.com/community/LiveCDCustomizationFromScratch)
[Debian Current live-build Manual](http://live.debian.net/manual/current/html/live-manual.en.html)
[Syslinux How Tos](http://www.syslinux.org/wiki/index.php/HowTos)
[Syslinux Common Problems: Missing Operating System](http://www.syslinux.org/wiki/index.php/Common_Problems#Missing_Operating_System_.28mbr.bin.29)
[Ubuntu Precise live-build man page](http://manpages.ubuntu.com/manpages/precise/man7/live-build.7.html)

The process for creating a live Debian environment has been documented by other more knowleadgeable people, but of all the guides I looked at no one had every step I needed.  I decided to document my steps in case anyone else might find them useful.

I have not tested any variation on these instructions nor have I tested building on any other system than my own.  Please let me know in the comments if you have any feedback or suggestions.

If you are wondering why I did not use live-build I will say that I fought with live-build 3.0~a24-1ubuntu32.5 for several evenings before I admitted defeat.

I could write a whole new post about the problems I had with that, but if anyone is curious, and if I can avoid going on too long of a tanget, this solved my biggest issue with that version of live-build.

In the config/binary_local-hooks directory create this hook script and make it executable.

```
#!/bin/sh
echo "Moving Kernel"
mv binary/live/vmlinuz-* binary/live/vmlinuz || true
mv binary/live/initrd.img-* binary/live/initrd.img || true
```

Even with that hook to properly setup the vmlinuz and initrd so that the live.cfg menu was accurate, I was never able to get a package list working or otherwise install packages of my choosing.

I don't know why precise 12.04 installs a version of live-build that appears to be unstable.  I worked with it for several evenings and I ran into a lot of problems.  Much of the documentation I found was either inaccurate or inappropriate for that version of live-build.

I have since tested live-build 2.0.12-1 on a Debian VM and saw a generic build worked.  I wish I had tested on another platform earlier or tried another version of live-build so I could see that it can work and does work well.  I believe live-build is the **right** way to build a Debian live envionrment, and my instructions are needlessly long, but like I said, my version of live-build would not cooperate.

I am aware that there is an [online live-build tool](http://live-build.debian.net/cgi-bin/live-build) for building a Debian live distribution. I tried it and I used the provided configuration options and got an email an hour later saying my build failed with no specifics.  I am sure the tool does work but at that point I had given up on live-build.

Although I wasted a few evenings I was able to get a good lesson in deboostrap, chroot, and how Debian live environments work.  I hope these instructions can help you too.
