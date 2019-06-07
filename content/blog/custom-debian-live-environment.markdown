---
title: "Create a Custom Debian Live Environment (CD or USB)"
date: 2018-02-08 18:36:00
lastmod: 2018-05-26 12:30:00
aliases: [
    /blog/create-a-custom-debian-live-environment/,
    /blog/create-a-custom-debian-stretch-live-environment-ubuntu-17-zesty/,
    /blog/create-a-custom-debian-wheezy-live-environment-ubuntu-12-precise/,
    /blog/create-a-custom-debian-jessie-live-environment-ubuntu-16-xenial/,
    /blog/create-custom-hybrid-debian-live-environment/
]
disqus: true
---

These are steps that I used on an **Ubuntu 18.04 LTS (Bionic Beaver)** 64-bit system to build an **x86 Debian 9 (Stretch)** live environment that I can boot from CD or USB.

These steps can be used to create a live environment that is BIOS bootable (MBR), UEFI bootable (GPT), or combination of both UEFI and BIOS bootable. Something unique about this guide is that **Syslinux/Isolinux are not used. Only Grub boot equipment.** This is done for consistency and to avoid mixing the two (Syslinux/Isolinux alone cannot accomplish everything covered in this article, but Grub can).

Here are some alternatives to my guide that may be better solutions for anyone reading this article: [live-build](https://manpages.debian.org/jessie/live-build/live-build.7.en.html), [mkusb](https://help.ubuntu.com/community/mkusb), [UNetbootin](https://unetbootin.github.io/), [xixer](https://github.com/jnalley/xixer), [rufus](https://rufus.akeo.ie/), [YUMI](https://www.pendrivelinux.com/yumi-multiboot-usb-creator/), [Simple-cdd](https://wiki.debian.org/Simple-CDD). You should also look at the [Debian DebianCustomCD documentation](https://wiki.debian.org/DebianCustomCD) as it will prove more informative than this article could ever be.

I wrote this guide more for educational purposes than anything. It is not necessarily the fastest guide or the best guide for your needs. I hope it is helpful all the same.

<!-- more -->

**<span class="warning">Warning</span>**: I have **<span class="warning">highlighted</span>** all the places you should be in the **<span class="warning">[chroot]</span>** environment. Be careful! Running some of these commands on your local environment instead of in the [chroot](https://en.wikipedia.org/wiki/Chroot) can damage your system.

# Prerequisites

Install applications we need to build the environment.

```
sudo apt-get install \
    debootstrap \
    squashfs-tools \
    xorriso \
    grub-pc-bin \
    grub-efi-amd64-bin \
    mtools
```

Create a directory where we will store all of the files we create throughout this guide.

```
mkdir $HOME/LIVE_BOOT
```

# Bootstrap and Configure Debian

Set up the base Debian environment. I am using `stretch` for my distribution and `i386` for the architecture. Consult the list of [debian mirrors](https://www.debian.org/mirror/list).

_Please change the URL in this command if there is a mirror that is closer to you._

```
sudo debootstrap \
    --arch=i386 \
    --variant=minbase \
    stretch \
    $HOME/LIVE_BOOT/chroot \
    http://ftp.us.debian.org/debian/
```

Chroot to the Debian environment we just bootstrapped.

```
sudo chroot $HOME/LIVE_BOOT/chroot
```

**<span class="warning">[chroot]</span>** Set a custom hostname for your Debian environment.

```
echo "debian-live" > /etc/hostname
```

**<span class="warning">[chroot]</span>** Figure out which Linux Kernel you want in the live environment.

```
apt-cache search linux-image
```

**<span class="warning">[chroot]</span>** I chose the image `linux-image-686`. I also believe `live-boot` is a necessity. `systemd-sys` (or an equivalent) is also necessary to provide init.

```
apt-get update && \
apt-get install --no-install-recommends \
    linux-image-686 \
    live-boot \
    systemd-sysv
```

**<span class="warning">[chroot]</span>** Install programs of your choosing, and then run `apt-get clean` to save some space. I use `--no-install-recommends` to avoid superfluous packages. You should decide what you need for your environment.

Read Debian's [ReduceDebian article](https://wiki.debian.org/ReduceDebian) for tips on reducing the size of your Debian environment if size is important and you want a minimal and compact installation. Please note that some live environments like [Tiny Core Linux](https://en.wikipedia.org/wiki/Tiny_Core_Linux) or [Puppy Linux](https://en.wikipedia.org/wiki/Puppy_Linux) are specifically optimized for a tiny footprint. Although this article results in a relatively tiny live environment, generating an environment that is only a couple dozen MB large takes additional effort not covered in this article.

```
apt-get install --no-install-recommends \
    network-manager net-tools wireless-tools wpagui \
    curl openssh-client \
    blackbox xserver-xorg-core xserver-xorg xinit xterm \
    nano && \
apt-get clean
```

**<span class="warning">[chroot]</span>** Set the root password. `root` will be the only user in this live environment by default, but you may add additional users as needed.

```
passwd root
```

**<span class="warning">[chroot]</span>** Exit the chroot.

```
exit
```

Create directories that will contain files for our live environment files and scratch files.

```
mkdir -p $HOME/LIVE_BOOT/{scratch,image/live}
```

Compress the chroot environment into a Squash filesystem.

```
sudo mksquashfs \
    $HOME/LIVE_BOOT/chroot \
    $HOME/LIVE_BOOT/image/live/filesystem.squashfs \
    -e boot
```

Copy the kernel and initramfs from inside the `chroot` to the `live` directory.

```
cp $HOME/LIVE_BOOT/chroot/boot/vmlinuz-* \
    $HOME/LIVE_BOOT/image/vmlinuz && \
cp $HOME/LIVE_BOOT/chroot/boot/initrd.img-* \
    $HOME/LIVE_BOOT/image/initrd
```

Create a menu configuration file for grub. Please note that the `insmod all_video` line was needed in my testing to deal with [a bug in UEFI booting](https://askubuntu.com/a/857008/413290) for one of my machines. Perhaps not everyone will need that line, but I did.

This config instructs Grub to use the `search` command to infer which device contains our live environment. This seems like the most portable solution considering the various ways we may write our live environment to bootable media.

```
cat <<'EOF' >$HOME/LIVE_BOOT/scratch/grub.cfg

search --set=root --file /DEBIAN_CUSTOM

insmod all_video

set default="0"
set timeout=30

menuentry "Debian Live" {
    linux /vmlinuz boot=live quiet nomodeset
    initrd /initrd
}
EOF
```

Create a special file in `image` named `DEBIAN_CUSTOM`. This file will be used to help `Grub` figure out which device contains our live filesystem. This file name must be unique and must match the file name in our `grub.cfg` config.

```
touch $HOME/LIVE_BOOT/image/DEBIAN_CUSTOM
```

Your `LIVE_BOOT` directory should now roughly look like this.

```
LIVE_BOOT/chroot/*tons of chroot files*
LIVE_BOOT/scratch/grub.cfg
LIVE_BOOT/image/DEBIAN_CUSTOM
LIVE_BOOT/image/initrd
LIVE_BOOT/image/vmlinuz
LIVE_BOOT/image/live/filesystem.squashfs
```

# Create a bootable medium

Please note that there are two **separate** sets of instructions below for creating a bootable medium for the live environment. One process is titled [Create Bootable ISO/CD]({{<relref "#create-bootable-iso-cd">}}) and the other, **separate process**, is titled [Create Bootable USB]({{<relref "#create-bootable-usb">}}).

* The **Create Bootable ISO/CD** instructions will result in an `.iso` image file containing our live environment.
* The **Create Bootable USB** instructions will result in our live environment being installed directly to a USB device.

The `.iso` file we create with the **Create Bootable ISO/CD** instructions can be burned to a CD-ROM (optical media), or written to a USB device with `dd`. The functionality that allows this "dd-able" behavior from our `.iso` file does _not_ come for free. The process is a bit complex, but that resultant behavior is common in many modern live environments such as the Ubuntu installation `.iso` file.

_Please note that writing an `.iso` file to a USB device is **not** the same as installing the live environment directly to a USB device. Read more in my [Notes]({{<relref "#notes">}}) which details my discoveries._

## Create Bootable ISO/CD

Install the live environment to an `.iso` file which can be burned to optical media.

As stated above, the `.iso` file generated by these steps **can** be written to a USB device with something like `dd`.

_I have separated the instructions for creating a BIOS bootable, UEFI bootable, or combination BIOS + UEFI bootable `.iso` in order to illustrate the separate processes. **Click either "BIOS", "UEFI", or "BIOS + UEFI" and follow the instructions that are appropriate for your needs.**_

{{% tab-nav "BIOS" "UEFI" "BIOS + UEFI" %}}
{{% tab selected="true" %}}

Create a grub BIOS image.

```
grub-mkstandalone \
    --format=i386-pc \
    --output=$HOME/LIVE_BOOT/scratch/core.img \
    --install-modules="linux normal iso9660 biosdisk memdisk search tar ls" \
    --modules="linux normal iso9660 biosdisk search" \
    --locales="" \
    --fonts="" \
    "boot/grub/grub.cfg=$HOME/LIVE_BOOT/scratch/grub.cfg"
```

Use `cat` to combine a bootable Grub `cdboot.img` bootloader with our boot image.

```
cat \
    /usr/lib/grub/i386-pc/cdboot.img \
    $HOME/LIVE_BOOT/scratch/core.img \
> $HOME/LIVE_BOOT/scratch/bios.img
```

Generate the ISO file.

```
xorriso \
    -as mkisofs \
    -iso-level 3 \
    -full-iso9660-filenames \
    -volid "DEBIAN_CUSTOM" \
    --grub2-boot-info \
    --grub2-mbr /usr/lib/grub/i386-pc/boot_hybrid.img \
    -eltorito-boot \
        boot/grub/bios.img \
        -no-emul-boot \
        -boot-load-size 4 \
        -boot-info-table \
        --eltorito-catalog boot/grub/boot.cat \
    -output "${HOME}/LIVE_BOOT/debian-custom.iso" \
    -graft-points \
        "${HOME}/LIVE_BOOT/image" \
        /boot/grub/bios.img=$HOME/LIVE_BOOT/scratch/bios.img
```

Now burn the ISO to a CD and you should be ready to boot from it using a BIOS system.
{{% /tab %}}

{{% tab %}}

Create a grub UEFI image.

```
grub-mkstandalone \
    --format=x86_64-efi \
    --output=$HOME/LIVE_BOOT/scratch/bootx64.efi \
    --locales="" \
    --fonts="" \
    "boot/grub/grub.cfg=$HOME/LIVE_BOOT/scratch/grub.cfg"
```

Create a FAT16 UEFI boot disk image containing the EFI bootloader. Note the use of the `mmd` and `mcopy` commands to copy our UEFI boot loader named `bootx64.efi`.

```
(cd $HOME/LIVE_BOOT/scratch && \
    dd if=/dev/zero of=efiboot.img bs=1M count=10 && \
    mkfs.vfat efiboot.img && \
    mmd -i efiboot.img efi efi/boot && \
    mcopy -i efiboot.img ./bootx64.efi ::efi/boot/
)
```

Generate the ISO file.

```
xorriso \
    -as mkisofs \
    -iso-level 3 \
    -full-iso9660-filenames \
    -volid "DEBIAN_CUSTOM" \
    -eltorito-alt-boot \
        -e EFI/efiboot.img \
        -no-emul-boot \
    -append_partition 2 0xef ${HOME}/LIVE_BOOT/scratch/efiboot.img \
    -output "${HOME}/LIVE_BOOT/debian-custom.iso" \
    -graft-points \
        "${HOME}/LIVE_BOOT/image" \
        /EFI/efiboot.img=$HOME/LIVE_BOOT/scratch/efiboot.img
```

Now burn the ISO to a CD and you should be ready to boot from it using a UEFI system.
{{% /tab %}}

{{% tab %}}

Create a grub UEFI image.

```
grub-mkstandalone \
    --format=x86_64-efi \
    --output=$HOME/LIVE_BOOT/scratch/bootx64.efi \
    --locales="" \
    --fonts="" \
    "boot/grub/grub.cfg=$HOME/LIVE_BOOT/scratch/grub.cfg"
```

Create a FAT16 UEFI boot disk image containing the EFI bootloader. Note the use of the `mmd` and `mcopy` commands to copy our UEFI boot loader named `bootx64.efi`.


```
(cd $HOME/LIVE_BOOT/scratch && \
    dd if=/dev/zero of=efiboot.img bs=1M count=10 && \
    mkfs.vfat efiboot.img && \
    mmd -i efiboot.img efi efi/boot && \
    mcopy -i efiboot.img ./bootx64.efi ::efi/boot/
)
```

Create a grub BIOS image.

```
grub-mkstandalone \
    --format=i386-pc \
    --output=$HOME/LIVE_BOOT/scratch/core.img \
    --install-modules="linux normal iso9660 biosdisk memdisk search tar ls" \
    --modules="linux normal iso9660 biosdisk search" \
    --locales="" \
    --fonts="" \
    "boot/grub/grub.cfg=$HOME/LIVE_BOOT/scratch/grub.cfg"
```

Use `cat` to combine a bootable Grub `cdboot.img` bootloader with our boot image.

```
cat \
    /usr/lib/grub/i386-pc/cdboot.img \
    $HOME/LIVE_BOOT/scratch/core.img \
> $HOME/LIVE_BOOT/scratch/bios.img
```

Generate the ISO file.

```
xorriso \
    -as mkisofs \
    -iso-level 3 \
    -full-iso9660-filenames \
    -volid "DEBIAN_CUSTOM" \
    -eltorito-boot \
        boot/grub/bios.img \
        -no-emul-boot \
        -boot-load-size 4 \
        -boot-info-table \
        --eltorito-catalog boot/grub/boot.cat \
    --grub2-boot-info \
    --grub2-mbr /usr/lib/grub/i386-pc/boot_hybrid.img \
    -eltorito-alt-boot \
        -e EFI/efiboot.img \
        -no-emul-boot \
    -append_partition 2 0xef ${HOME}/LIVE_BOOT/scratch/efiboot.img \
    -output "${HOME}/LIVE_BOOT/debian-custom.iso" \
    -graft-points \
        "${HOME}/LIVE_BOOT/image" \
        /boot/grub/bios.img=$HOME/LIVE_BOOT/scratch/bios.img \
        /EFI/efiboot.img=$HOME/LIVE_BOOT/scratch/efiboot.img
```

Now burn the ISO to a CD and you should be ready to boot from it using either a UEFI or a BIOS system.
{{% /tab %}}
{{% /tab-nav %}}

## Create Bootable USB

Install the live environment to a USB device.

As stated above, installing a live environment to a USB device is **not** the same as writing an `.iso` file to a USB device. The end result is the same for the most part in both those scenarios, but there are subtle differences worth understanding, and there are valid reasons someone may want to install a live environment directly to a USB device rather than writing an `.iso` file to a USB device.

_I have separated the instructions for creating a BIOS bootable, UEFI bootable, or combination BIOS + UEFI bootable USB device in order to illustrate the separate processes. **Click either "BIOS", "UEFI", or "BIOS + UEFI" and follow the instructions that are appropriate for your needs.**_

{{% tab-nav "BIOS" "UEFI" "BIOS + UEFI" %}}
{{% tab selected="true" %}}
I am assuming you have an umounted **blank** USB drive at **/dev/sdz**.  To allow easily swapping in a real block device, I am using a variable named `$disk` in these commands.

Export the `disk` variable.

```
export disk=/dev/sdz
```

Create a mount point for the USB drive.

```
sudo mkdir -p /mnt/usb
```

Partition the USB drive using `parted`. This command creates 1 partition in a traditional MBR layout.

```
sudo parted --script $disk \
    mklabel msdos \
    mkpart primary fat32 1MiB 100%
```

Format the partition.

```
sudo mkfs.vfat -F32 ${disk}1
```

Mount the partition.

```
sudo mount ${disk}1 /mnt/usb
```

Install Grub for i386-pc booting.

```
sudo grub-install \
    --target=i386-pc \
    --boot-directory=/mnt/usb/boot \
    --recheck \
    $disk
```

Create a `live` directory on the USB device.

```
sudo mkdir -p /mnt/usb/{boot/grub,live}
```

Copy the Debian live environment files we previously generated to the USB disk.

```
sudo cp -r $HOME/LIVE_BOOT/image/* /mnt/usb/
```

Copy the `grub.cfg` boot configuration to the USB device.

```
sudo cp \
    $HOME/LIVE_BOOT/scratch/grub.cfg \
    /mnt/usb/boot/grub/grub.cfg
```

Now unmount the disk and you should be ready to boot from it on a BIOS system.

```
sudo umount /mnt/usb
```
{{% /tab %}}

{{% tab %}}
I am assuming you have an umounted **blank** USB drive at **/dev/sdz**. To allow easily swapping in a real block device, I am using a variable named `$disk` in these commands.

Export the `disk` variable.

```
export disk=/dev/sdz
```

Create some mount points for the USB drive.

```
sudo mkdir -p /mnt/{usb,efi}
```

Partition the USB drive using `parted`. This command creates 2 partitions in a GPT (Guid Partition Table) layout. One partition for UEFI, and one for our Debian OS and other live data.

```
sudo parted --script $disk \
    mklabel gpt \
    mkpart ESP fat32 1MiB 200MiB \
        name 1 EFI \
        set 1 esp on \
    mkpart primary fat32 200MiB 100% \
        name 2 LINUX \
        set 2 msftdata on
```

Format the UEFI and data partitions.

```
sudo mkfs.vfat -F32 ${disk}1 && \
sudo mkfs.vfat -F32 ${disk}2
```

Mount the partitions.

```
sudo mount ${disk}1 /mnt/efi && \
sudo mount ${disk}2 /mnt/usb
```

Install Grub for x86_64 UEFI booting.

```
sudo grub-install \
    --target=x86_64-efi \
    --efi-directory=/mnt/efi \
    --boot-directory=/mnt/usb/boot \
    --removable \
    --recheck
```

Create a `live` directory on the USB device.

```
sudo mkdir -p /mnt/usb/{boot/grub,live}
```

Copy the Debian live environment files we previously generated to the USB disk.

```
sudo cp -r $HOME/LIVE_BOOT/image/* /mnt/usb/
```

Copy the `grub.cfg` boot configuration to the USB device.

```
sudo cp \
    $HOME/LIVE_BOOT/scratch/grub.cfg \
    /mnt/usb/boot/grub/grub.cfg
```

Now unmount the disk and you should be ready to boot from it on a UEFI system.

```
sudo umount /mnt/{usb,efi}
```
{{% /tab %}}

{{% tab %}}
I am assuming you have an umounted **blank** USB drive at **/dev/sdz**. To allow easily swapping in a real block device, I am using a variable named `$disk` in these commands.

Export the `disk` variable.

```
export disk=/dev/sdz
```

Create some mount points for the USB drive.

```
sudo mkdir -p /mnt/{usb,efi}
```

Partition the USB drive using `parted`. This command creates 3 partitions in a GPT (Guid Partition Table) layout. One partition for the BIOS boot record, one for UEFI, and one for our Debian OS and other live data.

```
sudo parted --script $disk \
    mklabel gpt \
    mkpart primary fat32 2048s 4095s \
        name 1 BIOS \
        set 1 bios_grub on \
    mkpart ESP fat32 4096s 413695s \
        name 2 EFI \
        set 2 esp on \
    mkpart primary fat32 413696s 100% \
        name 3 LINUX \
        set 3 msftdata on
```

Generate a hybrid MBR for the USB device. Note, this is non-standard and so may not work on all systems. The [only](https://tails.boum.org/blueprint/usb_install_and_upgrade/gpt/) [guides](https://wiki.gentoo.org/wiki/Hybrid_partition_table) [I've](https://wiki.archlinux.org/index.php/Multiboot_USB_drive#Hybrid_UEFI_GPT_.2B_BIOS_GPT.2FMBR_boot) found on hybrid MBRs show that it must be done with `gdisk`. `gdisk` supports commands [not in](https://manpages.debian.org/unstable/gdisk/sgdisk.8.en.html) `sgdisk`, so this command is not easily scriptable. The documentation for `gdisk` warn that this procedure is [non-standard, flaky, and unsupported](http://www.rodsbooks.com/gdisk/hybrid.html), but this does _generally_ seem to do what is expected. It allows for both BIOS and UEFI booting from the same USB device.

```
sudo gdisk $disk << EOF
r     # recovery and transformation options
h     # make hybrid MBR
1 2 3 # partition numbers for hybrid MBR
N     # do not place EFI GPT (0xEE) partition first in MBR
EF    # MBR hex code
N     # do not set bootable flag
EF    # MBR hex code
N     # do not set bootable flag
83    # MBR hex code
Y     # set the bootable flag
x     # extra functionality menu
h     # recompute CHS values in protective/hybrid MBR
w     # write table to disk and exit
Y     # confirm changes
EOF
```

Format the UEFI and data partitions.

```
sudo mkfs.vfat -F32 ${disk}2 && \
sudo mkfs.vfat -F32 ${disk}3
```

Mount the partitions.

```
sudo mount ${disk}2 /mnt/efi && \
sudo mount ${disk}3 /mnt/usb
```

Install Grub for x86_64 UEFI booting.

```
sudo grub-install \
    --target=x86_64-efi \
    --efi-directory=/mnt/efi \
    --boot-directory=/mnt/usb/boot \
    --removable \
    --recheck
```

Install Grub for i386-pc booting.

```
sudo grub-install \
    --target=i386-pc \
    --boot-directory=/mnt/usb/boot \
    --recheck \
    $disk
```

Create a `live` directory on the USB device.

```
sudo mkdir -p /mnt/usb/{boot/grub,live}
```

Copy the Debian live environment files we previously generated to the USB disk.

```
sudo cp -r $HOME/LIVE_BOOT/image/* /mnt/usb/
```

Copy the `grub.cfg` boot configuration to the USB device.

```
sudo cp \
    $HOME/LIVE_BOOT/scratch/grub.cfg \
    /mnt/usb/boot/grub/grub.cfg
```

Now unmount the disk and you should be ready to boot from it on either a BIOS or UEFI system.

```
sudo umount /mnt/{usb,efi}
```
{{% /tab %}}
{{% /tab-nav %}}

{{% accordion "Notes" %}}

Please note that the result of writing an `.iso` file generated by the **ISO/CD** instructions to a USB device is **not the same** as the other set of instructions for **Direct USB**.

If you write an `.iso` to a USB device you are deleting all the data (including partitions/filesystem) on that USB device and replacing them with a **read-only** `iso9660` filesystem, which is normally what we see on CDs! On the other hand, if we use the **Direct USB** instructions, then the USB device will have traditional partitions that we can read from and write to on any standard machine.

Please read in entirety the [syslinux isohybrid MBR article](https://www.syslinux.org/wiki/index.php?title=Isohybrid) and the [El-Torito article on Hybrid ISO booting](https://wiki.osdev.org/El-Torito#Hybrid_Setup_for_BIOS_and_EFI_from_CD.2FDVD_and_USB_stick) and their related articles. The [Debian xorriso man page](https://manpages.debian.org/jessie/xorriso/xorrisofs.1.en.html) has excellent documentation around ISO/USB booting as well.

Syslinux/Isolinux are [more](https://wiki.osdev.org/El-Torito#Hybrid_Setup_for_BIOS_and_EFI_from_CD.2FDVD_and_USB_stick)
[commonly](https://wiki.archlinux.org/index.php/Remastering_the_Install_ISO#Create_a_new_ISO)
 used when creating an `.iso` that can also be written directly to USB, but the [Debian xorrisofs docs](https://manpages.debian.org/stretch/xorriso/xorrisofs.1.en.html) say the following.

> EFI boot equipment may be combined with above ISOLINUX isohybrid for PC-BIOS in a not really UEFI-2.4 compliant way...

I don't like that `not really...compliant` bit.

Though, the docs also point out that it _does_ work well. However, I'm trying to consolidate on Grub to avoid a mix of Syslinux configs/files and Grub commands/files.

Figuring out the right syntax and bootloaders to use for each command was a nightmare, and took a lot of time and reading and trial and error. I realize there are simpler commands like `grub-mkrescue`, but I wanted to explicitly call out the manual commands used for each process.

The [GNU xorrisofs docs](https://www.gnu.org/software/xorriso/man_1_xorriso.html) seem outdated. The [Debian docs](https://manpages.debian.org/stretch/xorriso/xorrisofs.1.en.html) were more reliable with better examples.

Examining the [grub-mkrescue](https://github.com/coreos/grub/blob/master/util/grub-mkrescue.c) source code and [this xorriso mailing list exchange](https://lists.gnu.org/archive/html/bug-xorriso/2015-04/msg00003.html) helped me figure out how to use the `--grub2-mbr` flag to install the standard MBR bootloader in the `.iso` file.

Supposedly, we can also use `-partition_offset` so the `.iso` can be written to USB to help for natural disk layouts on the USB device, but I could not figure out how to get that working.

> ... facilitates later manipulations of the USB stick by tools for partitioning and formatting...

This blurb is confusing, but I realized it means `Grub` can be used as the boot equipment for a CD in the same way we would use Syslinux with isohybrid MBR entries.

> More compliant with UEFI-2.4 is to decide for either MBR or GPT and to append a copy of the EFI System Partition in order to avoid overlap of ISO partition and EFI partition. Here for MBR:
>
>        -eltorito-alt-boot -e 'boot/grub/efi.img' -no-emul-boot \
>        -append_partition 2 0xef ./CD_root/boot/grub/efi.img \
>
> The resulting ISOs are supposed to boot from optical media and USB stick. One may omit option -eltorito-alt-boot if no option -b is used to make the ISO bootable via PC-BIOS.

That worked wonderfully for me to get a pure Grub result.

This is a super handy command for examining the commands that may have been used to generate an `.iso` file.

```
xorriso -hfsplus on -indev IMAGE.iso \
-report_el_torito plain -report_system_area plain \
-print "" -print "======= Proposal for xorrisofs options:" \
-report_el_torito as_mkisofs
```

Figuring out which modules are needed for what behavior is frustrating. There are docs, but they do not seem to easily correlate to "this is required to list devices with `ls`" and similar behavior. I eventually found the magic combo for `grub-mkstandalone`, which cuts down a few steps. Here's how to do it with `grub-mkimage`. More verbose, but easier to debug.

Create a Grub early config file. Note that the label `DEBIAN_CUSTOM` matters. We must use the same label on our `.iso` so that Grub always knows where to find our boot media.

```
cat <<'EOF' >$HOME/LIVE_BOOT/scratch/embedded.cfg
search --no-floppy --set=root --label DEBIAN_CUSTOM
EOF
```

Generate a memdisk ourselves.

```
tar \
    -C $HOME/LIVE_BOOT/scratch \
    --transform 's;\.;boot/grub;' \
    -cf $HOME/LIVE_BOOT/scratch/memdisk.tar \
    ./grub.cfg
```

Bring it all together.

```
grub-mkimage \
    --directory=/usr/lib/grub/i386-pc \
    --format=i386-pc \
    --prefix="/boot/grub" \
    --output=$HOME/LIVE_BOOT/scratch/core.img \
    --memdisk=$HOME/LIVE_BOOT/scratch/memdisk.tar \
    --config=$HOME/LIVE_BOOT/scratch/embedded.cfg \
    linux normal iso9660 biosdisk memdisk search tar
```

{{% /accordion %}}

# Citations

* [sgdisk(8) - Linux man page](https://linux.die.net/man/8/sgdisk)
* [Hybrid UEFI GPT + BIOS GPT/MBR boot](https://wiki.archlinux.org/index.php/Multiboot_USB_drive#Hybrid_UEFI_GPT_.2B_BIOS_GPT.2FMBR_boot)
* ["No suitable mode found" error](https://wiki.archlinux.org/index.php/GRUB#.22No_suitable_mode_found.22_error)
* [Where is the memtest option on the Ubuntu 64-bit live CD?](https://askubuntu.com/questions/258991/where-is-the-memtest-option-on-the-ubuntu-64-bit-live-cd)
* [Remastering the Install ISO](https://wiki.archlinux.org/index.php/Remastering_the_Install_ISO)
* [Install GRUB2 in (U)EFI systems](https://help.ubuntu.com/community/UEFIBooting#Install_GRUB2_in_.28U.29EFI_systems)
* [6.4 Embedding a configuration file into GRUB](https://www.gnu.org/software/grub/manual/grub/html_node/Embedded-configuration.html)
* [Standalone Grub2 EFI installation - grub.cfg placement?](https://askubuntu.com/questions/643938/standalone-grub2-efi-installation-grub-cfg-placement)
* [actual usage of 'grub-mkimage --config= '](https://unix.stackexchange.com/questions/253657/actual-usage-of-grub-mkimage-config)
* [GRUB2 How To (4): memdisk and loopback device](http://lukeluo.blogspot.com/2013/06/grub-how-to-4-memdisk-and-loopback.html)
* [How does the grub efi loader find the correct grub.cfg and boot directory?](https://unix.stackexchange.com/questions/267765/how-does-the-grub-efi-loader-find-the-correct-grub-cfg-and-boot-directory)
* [How to Rescue a Non-booting GRUB 2 on Linux](https://www.linux.com/learn/how-rescue-non-booting-grub-2-Linux)
* [Using a CD](https://help.ubuntu.com/community/BootFromUSB#Using_a_CD)
* [Boot Linux with extlinux from EFI & GPT](https://superuser.com/questions/746553/boot-linux-with-extlinux-from-efi-gpt)
* [GRUB2 Modules](https://blog.fpmurphy.com/2010/06/grub2-modules.html)
* [grub-install.c](https://github.com/coreos/grub/blob/master/util/grub-install.c)
* [Grub2/Troubleshooting](https://help.ubuntu.com/community/Grub2/Troubleshooting)
* [Set up PreLoader](https://wiki.archlinux.org/index.php/Secure_Boot#Set_up_PreLoader)
* [Using PreLoader](https://wiki.archlinux.org/index.php/REFInd#Using_PreLoader)
* [build.sh](https://github.com/Mic92/archlive/blob/master/build.sh#L138)
* [Archiso](https://wiki.archlinux.org/index.php/archiso#Installing_packages_from_multilib)
* [The simple menu system](https://www.syslinux.org/wiki/index.php?title=Menu#The_simple_menu_system)
* [UEFI](https://www.syslinux.org/wiki/index.php?title=Isohybrid#UEFI)
* [Make UEFI bootable live CD](https://www.linuxquestions.org/questions/linux-general-1/make-uefi-bootable-live-cd-926021/)
* [What is the proper way to use ISOLINUX with UEFI?](https://unix.stackexchange.com/questions/285193/what-is-the-proper-way-to-use-isolinux-with-uefi)
* [Booting from removable media](https://wiki.debian.org/UEFI#Booting_from_removable_media)
* [UEFI systems](https://wiki.archlinux.org/index.php/GRUB#UEFI_systems)
* [Managing EFI Boot Loaders for Linux: EFI Boot Loader Installation](https://www.rodsbooks.com/efi-bootloaders/installation.html)
* [Examples](https://wiki.archlinux.org/index.php/syslinux#Boot_prompt)
* [Grub2 El-Torito CD](https://forum.osdev.org/viewtopic.php?t=22169&p=178135)
* [Create ISO image with GRUB2](https://forum.osdev.org/viewtopic.php?f=1&t=23766)
* [DebianLive MultibootISO](https://wiki.debian.org/DebianLive/MultibootISO)
* [11 GRUB image files](https://www.gnu.org/software/grub/manual/grub/html_node/Images.html)
* [stage2_eltorito missing](https://www.linuxquestions.org/questions/linux-software-2/stage2_eltorito-missing-884944/)
* [3.4 Making a GRUB bootable CD-ROM](https://www.gnu.org/software/grub/manual/legacy/Making-a-GRUB-bootable-CD_002dROM.html)
* [why is grub2 ignoring kernel options when boot from el torito on CD?](https://unix.stackexchange.com/questions/283994/why-is-grub2-ignoring-kernel-options-when-boot-from-el-torito-on-cd)
* [Boot UEFI does not work from CD/DVD](https://communities.vmware.com/message/2228281#2228281)
* [UEFI problem after upgrading to VMWS player 12](https://communities.vmware.com/message/2583742#2583742)
* [make-efi](https://github.com/linuxkit/linuxkit/blob/master/tools/mkimage-iso-efi/make-efi)
* [UEFI + BIOS bootable live Debian stretch amd64 with persistence](https://unix.stackexchange.com/questions/382817/uefi-bios-bootable-live-debian-stretch-amd64-with-persistence)
* [[syslinux] Isohybrid wiki page and UEFI](https://www.syslinux.org/archives/2015-April/023381.html)

