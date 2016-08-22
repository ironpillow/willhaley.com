---
title: "Create a Custom Hybrid (Mac or PC) Debian Live USB"
date: 2017-05-07 11:01:00
published: false
---

These are steps that I used on an **Ubuntu 16.04.2 LTS (Xenial Xerus)** 64-bit system to build a custom **x86 Debian 9 (Stretch)** live environment that I can boot from a USB drive.

These steps are a bit unique from [other guides]({{<relref "custom-debian-live-environment.markdown" >}}) I've written on this topic. The key difference is that these steps allow you to create a USB drive with a hybrid boot record.

The benefit of a hybrid boot partition table configuration is that the MBR and GPT records can be used to boot on both an [EFI/UEFI](https://en.wikipedia.org/wiki/Unified_Extensible_Firmware_Interface) and a BIOS system.

That means that this USB disk can be used on both Apple Macs and Windows/generic PCs!

Hybrid boot records come with some warnings. They are not officially supported and may not work on all systems. However, they are commonly used and worked perfectly fine in my testing.

Please also note that Debian 8 (Jessie) and older **will not work** as a valid target OS with these steps. Try as I did, I could not get Apple touchpad (clickpad) support working unless I used Debian 9. I'm sure it is possible, but you are better off using a more modern OS to save yourself the hassle if you plan to support Macs.

**This article is periodically updated.**

See other related articles here:

* [Create a Custom Debian Live Environment (CD or USB)]({{<relref "custom-debian-live-environment.markdown" >}})
* [Perform a Custom Debian Hard Drive Install]({{<relref "custom-debian-hard-drive-install.markdown" >}})
* [Install Debian to USB Drive]({{<relref "install-debian-usb.markdown" >}})

<!-- more -->

# Configure Debian

**<span class="warning">Warning</span>**: I have **<span class="warning">highlighted</span>** all the places you should be in the chroot environment. Be careful! Running some of these commands on your local environment instead of in the chroot can cause issues.

1. Install applications we need to build the environment.

    ```
    sudo apt-get install \
        debootstrap syslinux isolinux squashfs-tools \
        genisoimage memtest86+ rsync gdisk \
        grub2-common grub-efi-amd64
    ```

1. Set up the base Debian environment. I am using Stretch for my distribution and i386 for the architecture. Please change your mirror if you are not in the U.S. or know of a mirror close to you.

    ```
    # Create a directory for the live environment.
    mkdir $HOME/live_boot
    ```

    ```
    sudo debootstrap \
        --arch=i386 \
        --variant=minbase \
        stretch $HOME/live_boot/chroot http://ftp.us.debian.org/debian/
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

    I chose the image `linux-image-586`. I also believe `live-boot` is a necessity. `systemd-sys` (or an equivalent) is also necessary to provide `init`.

    ```
    apt-get update && \
	apt-get install --no-install-recommends --yes --force-yes \
        linux-image-586 live-boot systemd-sysv
	```

1. **<span class="warning">chroot</span>**

	Install programs of your choosing, and then run `apt-get clean` to save some space. I use `--no-install-recommends` to avoid superfluous packages. You should decide what you need for your environment.

	```
	apt-get install --no-install-recommends --yes --force-yes \
        network-manager net-tools wireless-tools wpagui \
        tcpdump wget openssh-client \
        blackbox xserver-xorg-core xserver-xorg x11-xserver-utils \
		xinit xterm \
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
    mkdir -p $HOME/live_boot/image/
    ```

1. Compress the chroot environment into a Squash filesystem.

    ```
	sudo mksquashfs \
		$HOME/live_boot/chroot \
		$HOME/live_boot/image/filesystem.squashfs \
		-noappend \
		-e boot
    ```

1. Copy our kernel and initramfs outside the chroot.

    ```
	cp $HOME/live_boot/chroot/boot/vmlinuz-4.9.0-2-686 \
		$HOME/live_boot/image/vmlinuz1 && \
	cp $HOME/live_boot/chroot/boot/initrd.img-4.9.0-2-686 \
		$HOME/live_boot/image/initrd1
    ```

# USB

<span class="warning">I am assuming that the USB drive you plan to use is at `/dev/sdz`. You **must** replace any instance of `/dev/sdz` in these steps with the with the location of **your** USB device or you may accidentally lose data.

1. Ensure none of your USB drive partitions are mounted.

    ```
    sudo umount /dev/sdz*
    ```

1. Wipe partition information from your USB drive.

    ```
    sudo wipefs -a /dev/sdz
    ```

    If you want to ensure your drive is totally wiped, you can do something like this to delete all data (including partition tables). This is a bit brute force and time consuming.

    ```
    sudo dd if=/dev/zero of=/dev/sdz
    ```

1. Create some mount points that we will need.

    ```
    sudo mkdir -p /mnt/{usb,efi}
    ```

1. Partition the USB drive using `sgdisk`. This command creates 3 partitions. One for the BIOS boot record, one for EFI, and one for our OS/data.

    ```
    sudo sgdisk \
        --new=1:2048:4095 \
            --typecode=1:ef02 \
            --change-name=1:"BIOS" \
            /dev/sdz \
        --new=2:4096:413695 \
            --typecode=2:ef00 \
            --change-name=2:"EFI" \
            /dev/sdz \
        --new=3:413696:`sgdisk -E /dev/sdz` \
            --typecode=3:8300 \
            --change-name=3:"LINUX" \
            /dev/sdz
    ```

1. Set up the hybrid partition records. I used [this Arch Linux](https://wiki.archlinux.org/index.php/Multiboot_USB_drive#Hybrid_UEFI_GPT_.2B_BIOS_GPT.2FMBR_boot) article as a guide.

    Unfortunately, `sgdisk` cannot be used to script this operation, because, ["If the active/bootable flag should be set, you must do so in another program..."](https://linux.die.net/man/8/sgdisk)

    ```
    sudo gdisk /dev/sdz << EOF
    r
    h
    1 2 3
    N
    EF
    N
    EF
    N
    83
    Y
    x
    h
    w
    Y
    EOF
    ```

1. Format the partitions.

    ```
    sudo mkfs.vfat -F32 -n EFI /dev/sdz2
    ```
    ```
    sudo mkfs.vfat -F32 -n LINUX /dev/sdz3
    ```

1. Mount the partitions.

    ```
    sudo mount /dev/sdz2 /mnt/efi
    ```
    ```
    sudo mount /dev/sdz3 /mnt/usb
    ```

1. Install the boot records.

	```
    sudo grub-install \
    	--target=x86_64-efi \
    	--efi-directory=/mnt/efi \
    	--boot-directory=/mnt/usb/boot \
    	--removable \
    	--recheck
    ```
    ```
    sudo grub-install \
    	--target=i386-pc \
    	--boot-directory=/mnt/usb/boot \
    	--recheck \
    	/dev/sdz
    ```

1. Copy the Debian live environment we created to the USB disk.

    ```
    sudo rsync -rv $HOME/live_boot/image/ /mnt/usb/live/
    ```

1. Delete the existing `grub.cfg` entry if there is one.

    ```
    sudo rm -f /mnt/usb/boot/grub/grub.cfg
    ```

1. Create a new `grub.cfg` entry.

    ```
    sudo nano /mnt/usb/boot/grub/grub.cfg
    ```

    It should look like this.

    ```
    set default="0"
    set timeout=10

    menuentry "Debian Live x86" {
    	linux /live/vmlinuz1 boot=live
    	initrd /live/initrd1
    }
    ```

1. Now unmount the disk and you should be ready to boot from it and go.

    ```
    sudo umount /dev/sdz*
    ```

Helpful documents:

* [Hybrid UEFI GPT + BIOS GPT/MBR boot](https://wiki.archlinux.org/index.php/Multiboot_USB_drive#Hybrid_UEFI_GPT_.2B_BIOS_GPT.2FMBR_boot)
* [Creating GPT partitions easily on the command line](https://suntong.github.io/blogs/2015/12/26/creating-gpt-partitions-easily-on-the-command-line/)
* [sgdisk(8) - Linux man page](https://linux.die.net/man/8/sgdisk)
* [GPT + Hybrid MBR, 3 partitions, 2nd one is bootable](https://tails.boum.org/blueprint/usb_install_and_upgrade/gpt/#index3h1)
* [Booting GPT disk on BIOS systems](http://www.lightofdawn.org/wiki/wiki.cgi/BIOSBootGPT)
* [Is a hybrid Linux USB-Stick for UEFI & legacy BIOS possible?](https://superuser.com/questions/801515/is-a-hybrid-linux-usb-stick-for-uefi-legacy-bios-possible)
* [How to Create a EFI/UEFI GRUB2 Multiboot USB drive to boot ISO images](https://ubuntuforums.org/showthread.php?t=2276498&p=13277465#post13277465)
* [Hybrid MBRs: The Good, the Bad, and the So Ugly You'll Tear Your Eyes Out](http://www.rodsbooks.com/gdisk/hybrid.html)
* [Hybrid partition table](https://wiki.gentoo.org/wiki/Hybrid_partition_table)
* [LiveCDCustomizationFromScratch](https://help.ubuntu.com/community/LiveCDCustomizationFromScratch)
* [Debian Current live-build Manual](http://live.debian.net/manual/current/html/live-manual.en.html)
* [Syslinux How Tos](http://www.syslinux.org/wiki/index.php/HowTos)
* [Syslinux Common Problems: Missing Operating System](http://www.syslinux.org/wiki/index.php/Common_Problems#Missing_Operating_System_.28mbr.bin.29)
* [Ubuntu Precise live-build man page](http://manpages.ubuntu.com/manpages/precise/man7/live-build.7.html)
