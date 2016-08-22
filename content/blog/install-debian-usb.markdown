---
title: "Install Debian to USB Drive"
date: 2017-06-10 00:00:00
disqus: true
---

<span class="warning">These instructions are **not** for a live install, but rather an installation of Debian to USB flash media.</span>

An added bonus here is that we're going to first prepare our Debian chroot inside an `img` file that we mount as a loopback device.

We can then use that `img` file as a generic base image that we can deploy to a large number of USB drives.

Why would you want to do this? Well, for one, the `img` file helps reduce some mess and gives you an easy to manage file that can be re-deployed again and again. This may also be ideal for creating a generic image that will be reused on multiple machines. Like you might do at a cybercafe where Debian is re-installed at each boot, or maybe for a classroom.

Thanks to Mike McCabe for the idea and for most of the steps detailed below.

See other related articles here:

* [Create a Custom Debian Live Environment (CD or USB)]({{<relref "custom-debian-live-environment.markdown" >}})
* [Perform a Custom Debian Hard Drive Install]({{<relref "custom-debian-hard-drive-install.markdown" >}})
<!-- * [Install Debian to USB Drive]({{<relref "install-debian-usb.markdown" >}}) -->

<!-- more -->

**<span class="warning">Warning</span>**: I have **<span class="warning">highlighted</span>** all the places you should be in the chroot environment. Be careful! Running some of these commands on your local environment instead of in the chroot can cause issues.

```
sudo apt-get install \
    debootstrap
```

Create the image file and format it.

```
fallocate -l 2G debian.img
echo -e "o\nn\np\n1\n\n\nw" | sudo fdisk debian.img
echo -e "a\nw\n" | sudo fdisk debian.img
```

**Take note of what is returned by the following command.** For me, the loopback device is `/dev/loop0`, but it may vary for you. Update the instructions below accordingly if your loopback device address differs.

```
sudo losetup --partscan --show --find debian.img
```

Format the linux partition of our loopback device, much like we would do for a real physical device.

```
sudo mkfs.ext4 /dev/loop0p1
```

Mount the partition.

```
sudo mkdir -p /mnt/debian
sudo mount /dev/loop0p1 /mnt/debian
```

Bootstrap the chroot.

```
sudo debootstrap \
    --arch=i386 \
    --variant=minbase \
    stretch /mnt/debian http://ftp.us.debian.org/debian/
```

Mount special devices to the chroot. This will be important for installing grub later.

```
sudo mount -t proc /proc /mnt/debian/proc
```

```
sudo mount -t sysfs /sys /mnt/debian/sys
```

```
sudo mount -o bind /dev /mnt/debian/dev
```

Change root to the chroot environment.

```
sudo chroot /mnt/debian
```

**<span class="warning">chroot</span>**

These packages are required at a minimum, but add more as needed.

**When prompted to install grub to a device, do NOT install it. Simply hit "Enter" and choose not to install it to any devices.**

```
apt-get update && \
apt-get install --no-install-recommends \
    linux-image-586 systemd-sysv \
	grub2-common grub-pc
```

**<span class="warning">chroot</span>**

We want `fstab` to mount `/` based on the disk label, and not a UUID or named disk like `/dev/sda`. That's because, depending on the machine, the USB drive _may not be /dev/sda_, and also because the UUID will vary depending on where the `img` file is deployed.

```
echo "LABEL=DEBUSB / ext4 defaults 0 1" > /etc/fstab
```

**<span class="warning">chroot</span>**

```
passwd root
```

**<span class="warning">chroot</span>**

```
grub-install \
    --target=i386-pc \
    --boot-directory=/boot \
    --force-file-id \
    --skip-fs-probe \
    --recheck /dev/loop0
```

**<span class="warning">chroot</span>**

```
exit
```

Edit the `grub.cfg` file in the `img`.

```
sudo nano /mnt/debian/boot/grub/grub.cfg
```

Paste this content into the `grub.cfg` file.

```
# grub.cfg
set default="0"
set timeout=10

menuentry "Debian" {
    linux /vmlinuz root=/dev/disk/by-label/DEBUSB quiet
    initrd /initrd.img
}
```

Label the image partition with the same name we used for `fstab` above.

```
sudo e2label /dev/loop0p1 DEBUSB
```

Set the hostname for the `img`.

```
echo "debian-usb" | sudo tee /mnt/debian/etc/hostname
```

Clean up special devices.

```
sudo umount /mnt/debian/{dev,sys,proc}
```

Unmount the loop device.

```
sudo umount /mnt/debian
```

Unmount the `img`.

```
sudo losetup -d /dev/loop0
```

Now you have a generic Debian installation that you can deploy to multiple devices like so.

```
dd if=debian.img of=/dev/sdz
```

# Citations

* [Installing Arch Linux on a USB key](https://wiki.archlinux.org/index.php/Installing_Arch_Linux_on_a_USB_key)
* [Boot from USB 3](http://www.wyae.de/docs/boot-usb3/)
* [Label a Linux Partition](https://www.cyberciti.biz/faq/linux-partition-howto-set-labels/)
* [How to generate a grub.cfg that uses LABELs not UUID's?](https://ubuntuforums.org/showthread.php?t=1529777)
* [GRUB](https://wiki.archlinux.org/index.php/GRUB)
* [6.3 Multi-boot manual config](https://www.gnu.org/software/grub/manual/html_node/Multi_002dboot-manual-config.html)
* [Safe to delete System.map-* files in /boot?](https://unix.stackexchange.com/questions/10010/safe-to-delete-system-map-files-in-boot)
* [GRUB2 booting with labels (no UUID)](https://ubuntuforums.org/showthread.php?t=1530532)
* [16.3.64 search](https://www.gnu.org/software/grub/manual/grub.html#search)
* [error: no such device: grub rescue>](https://ubuntuforums.org/showthread.php?t=1854142)
* [grub rescue -> no such partition [duplicate]](https://askubuntu.com/questions/491604/grub-rescue-no-such-partition)
* [How to install grub into an .img file?](https://superuser.com/questions/130955/how-to-install-grub-into-an-img-file)
* [How to fix boot into initramfs prompt and “mount: can't read '/etc/fstab': No such file or directory” and “No init found”?](https://unix.stackexchange.com/questions/120198/how-to-fix-boot-into-initramfs-prompt-and-mount-cant-read-etc-fstab-no-su)
* [`sudo echo “bla” >> /etc/sysctl.conf` permission denied](https://serverfault.com/questions/540492/sudo-echo-bla-etc-sysctl-conf-permission-denied)
* [mount dev, proc, sys in a chroot environment?](https://superuser.com/questions/165116/mount-dev-proc-sys-in-a-chroot-environment)
