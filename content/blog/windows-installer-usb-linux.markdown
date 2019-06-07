---
title: "Boot Windows 10 Installer from USB With GRUB"
date: 2017-12-20 19:32:00
lastmod: 2019-05-27 20:34:00
---

You can use these instructions to create a bootable USB drive with GRUB that can run the Windows 10 installer. I used Arch Linux to prepare my USB device, but any Linux variant like Debian or Ubuntu should work.

I am assuming you have an appropriately large USB disk at `/dev/sdz` that you can completely erase for this process.

Unmount the USB drive if mounted.

```
sudo umount /dev/sdz*
```

Wipe all partitions from the USB device.

```
sudo dd if=/dev/zero of=/dev/sdz bs=512 count=1 conv=notrunc
```

Use `sfdisk` to create two partitions. The first partition will be a `500MiB` bootable (`*`) Linux partition and the second partition will be an `ntfs` partition (`7`) that takes up the remaining space.

```
sudo sfdisk /dev/sdz << EOF
,500M,,*
,,7,;
EOF
```

Format the first partition, `/dev/sdz1` as `ext4`.

```
sudo mkfs.ext4 /dev/sdz1
```

Format the second partition, `/dev/sdz2` as `ntfs`.

```
sudo mkfs.ntfs /dev/sdz2
```

Mount `/dev/sdz1` somewhere local. In my case, I am using `/mnt/part1`.

```
sudo mount /dev/sdz1 /mnt/part1
```

Mount `/dev/sdz2` somewhere local. In my case, I am using `/mnt/part2`.

```
sudo mount /dev/sdz2 /mnt/part2
```

Mount your Windows 10 installation ISO. In my case, I am mounting it at `/mnt/win10`.

```
mount -t udf ~/win10.iso /mnt/win10
```

Install grub to the `ext4` partition (`sdz1`). This command provides a minimal GRUB install inspired by [an Arch Linux article](https://wiki.archlinux.org/index.php/GRUB/Tips_and_tricks#GRUB_standalone).

_I will admit I don't entirely know what each module here does, but I chose a minimal list that seemed to be needed for my configuration._

```
sudo grub-install \
    --no-floppy \
    --target=i386-pc \
    --recheck \
    --debug \
    --locales="en@quot" \
    --themes="" \
    --root-directory=/mnt/part1 \
    --boot-directory=/mnt/part1/grub-boot \
    --install-modules="ntldr normal search ntfs" \
    /dev/sdz
```

Create a `grub.cfg` GRUB configuration file at `/mnt/part1/grub-boot/grub/grub.cfg`. Here is a relatively minimal `grub.cfg` based on [a few](https://askubuntu.com/questions/367011/boot-windows-7-iso-from-grub2) [articles](https://unix.stackexchange.com/questions/665/installing-grub-2-on-a-usb-flash-drive).

```
# USB Device:/grub-boot/grub/grub.cfg

set timeout=10 set default=0

menuentry "Windows 10 Installer" {
    insmod ntfs
    search --set=root --file /bootmgr
    ntldr /bootmgr
    boot
}
```

Copy Windows 10 installation files to the `ntfs` partition (`sdz2`).

```
rsync -vr /mnt/win10/ /mnt/part2/
```

Sync files to the device. Depending on the speed of your device, this may take some time.

```
sync
```

Clean up.

```
sudo umount /dev/sdz*
```

Boot! You should be all set to go at this point.

If, when booting to Windows 10 from the USB device, you encounter an error saying this:

> A media driver your computer needs is missing. This could be a DVD, USB or Hard disk driver. If you have a CD, DVD, or USB flash drive with the driver on it, please insert it now.
>
> Note: If the installation media for Windows is in the DVD drive or on a USB drive, you can safely remove it for this step.

then you may want to look at a [Microsoft Community article](https://answers.microsoft.com/en-us/windows/forum/windows_10-windows_install/windows-10-clean-install-a-media-driver-your/3068a127-f088-44a2-af36-ba90a1604855) addressing that issue. You may also want to verify that all the files copied properly during `rsync` or re-copy the files anyway just in case something was corrupt. You may also want to verify the integrity of the source Windows 10 `iso` file. Finally, I found that USB 2.0 drivers worked far more reliably for me than USB 3.0, and resolved that error when I encountered it on one of my machines.