---
title: "Create a Custom Debian 9 (Stretch) Live Environment (CD or USB) using Ubuntu 17.04 (Zesty)"
date: 2017-08-27 00:00:00
date_modified: 2017-02-08 18:36:00
published: false
---

These are steps that I used on an **Ubuntu 17.04 LTS (Zesty Zapus)** 64-bit system to build an **x86 Debian 9 (Stretch)** live environment that I can boot from CD or USB

_This article is periodically updated. Old versions and comments are archived and hidden._

See other related articles here:

* [Perform a Custom Debian Hard Drive Install]({{<relref "custom-debian-hard-drive-install.markdown" >}})
* [Install Debian to USB Drive]({{<relref "install-debian-usb.markdown" >}})

<!-- more -->

**<span class="warning">Warning</span>**: I have **<span class="warning">highlighted</span>** all the places you should be in the chroot environment. Be careful! Running some of these commands on your local environment instead of in the chroot can cause issues.

1. Install applications we need to build the environment.

    ```
    sudo apt-get install \
        debootstrap \
        syslinux \
        isolinux \
        squashfs-tools \
        genisoimage \
        memtest86+ \
        rsync
    ```

1. Set up the base Debian environment. I am using `stretch` for my distribution and `i386` for the architecture. Please change your mirror if you are not in the U.S. or know of a mirror close to you.

    ```
    # Create a directory for the live environment.
    mkdir $HOME/live_boot
    ```

    ```
    sudo debootstrap \
        --arch=i386 \
        --variant=minbase \
        stretch $HOME/live_boot/chroot \
        http://ftp.us.debian.org/debian/
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

    I chose the image `linux-image-586`. I also believe `live-boot` is a necessity. `systemd-sys` (or an equivalent) is also necessary to provide init.

    ```
    apt-get update && \
    apt-get install \
        --no-install-recommends \
        --yes \
        --force-yes \
        linux-image-586 \
        live-boot \
        systemd-sysv
    ```

1. **<span class="warning">chroot</span>**

    Install programs of your choosing, and then run `apt-get clean` to save some space. I use `--no-install-recommends` to avoid superfluous packages. You should decide what you need for your environment.

    ```
    apt-get install --no-install-recommends --yes --force-yes \
        network-manager net-tools wireless-tools wpagui \
        tcpdump wget openssh-client \
        blackbox xserver-xorg-core xserver-xorg xinit xterm \
        pciutils usbutils gparted ntfs-3g hfsprogs rsync dosfstools \
        syslinux partclone nano pv \
        rtorrent iceweasel chntpw && \
    apt-get clean
    ```

1. **<span class="warning">chroot</span>**

    Set the root password (`root` will be the only user in this live environment)

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
		cp chroot/boot/vmlinuz-4.9.0-3-686 image/live/vmlinuz1
		cp chroot/boot/initrd.img-4.9.0-3-686 image/live/initrd1
	)
    ```

1. Create a menu for the isolinux bootloader. Create a text file at `$HOME/live_boot/image/isolinux/isolinux.cfg` with this content.

    ```
    UI menu.c32

    prompt 0
    menu title Debian Live

    timeout 300

    label Debian Live 4.9.0-3-686
    menu label ^Debian Live 4.9.0-3-686
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

Copy files necessary for the USB to boot and copy the environment to the USB drive (I am assuming you have an umounted **FAT32** formatted USB drive **/dev/sdz** and the **BOOT** flag is set on /dev/sdz1 and you have a ready mount point at **/mnt/usb**)

```
sudo syslinux -i /dev/sdz1
sudo dd \
    if=/usr/lib/syslinux/mbr.bin \
    of=/dev/sdz \
    conv=notrunc bs=440 count=1
sudo mount /dev/sdz1 /mnt/usb
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
