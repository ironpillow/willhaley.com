---
title: "Perform a Custom Debian Hard Drive Install"
date: 2017-05-07 15:00:00
disqus: true
---

The stock Debian installer provided by Debian is fantastic. It is intuitive, and simple. However, if you want a custom install for whatever reason (specific configuration, machine deployment, minimal image), you can use these steps to accomplish that.

To do this, we will need any Debian-based live CD. You can use my guide for [creating a custom Debian Live CD or USB]({{<relref "custom-debian-live-environment.markdown" >}}) to generate this, or simply use an Ubuntu or Debian live CD or USB.

The advantage of using a custom live environment is that you can package the tools you need in the live environment so they are always available. If you use the stock Ubuntu or Debian live CDs, you may need a network connection to install the required tools.

**This article is periodically updated.**

See other related articles here:

* [Create a Custom Debian Live Environment (CD or USB)]({{<relref "custom-debian-live-environment.markdown" >}})
<!-- * [Perform a Custom Debian Hard Drive Install]({{<relref "custom-debian-hard-drive-install.markdown" >}}) -->
* [Install Debian to USB Drive]({{<relref "install-debian-usb.markdown" >}})

<!-- more -->

**<span class="warning">Warning</span>**: I have **<span class="warning">highlighted</span>** all the places you should be in the target install chroot.

1. Boot the machine using your live CD or USB and install the necessary tools (assuming they are not already available).

    ```
    sudo apt-get install debootstrap
    ```

1. Determine the device where you want to install your customized Debian.

    <span class="warning">I am assuming that the hard disk you plan to use is at `/dev/sdz`, that you only want one partition on that disk, and that you want to use MBR with grub2.</span>

    <span class="warning">You **must** replace any instance of `/dev/sdz` in these steps with the with the location of **your** hard drive or you may accidentally lose data.</span>

1. Create an MBR table with one bootable Linux partition.

    ```
    echo -e "o\nn\np\n1\n\n\nw" | sudo fdisk /dev/sdz
    ```
    ```
    echo -e "a\nw\n" | sudo fdisk /dev/sdz
    ```

1. Format the partition.

    ```
    sudo mkfs.ext4 /dev/sdz1
    ```

1. Create a mount point if it does not already exist.

    ```
    sudo mkdir -p /mnt
    ```

1. Mount the partition.

    ```
    sudo mount /dev/sdz1 /mnt
    ```

1. Set up the base Debian install. I am using Stretch for my distribution and i386 for the architecture. Please change your mirror if you are not in the U.S. or if you know of a mirror closer to you.

    ```
    sudo debootstrap \
        --arch=i386 \
        --variant=minbase \
        stretch /mnt http://ftp.us.debian.org/debian/
    ```

1. Bind `/dev` and `/proc` from the host to the chroot.

    ```
    sudo mount -o bind /dev /mnt/dev
    ```
    ```
    sudo mount -t proc /proc /mnt/proc
    ```

1. Chroot to our Debian install.

    ```
    sudo chroot /mnt
    ```

1. **<span class="warning">chroot</span>**

    Figure out which Linux Kernel you want in your install.

    ```
    apt-cache search linux-image
    ```

    I chose the image `linux-image-586`. `systemd-sys` (or an equivalent) is necessary to provide `init`.

    ```
    apt-get update && \
    apt-get install --no-install-recommends \
        linux-image-586 systemd-sysv
    ```

1. **<span class="warning">chroot</span>**

    Install programs of your choosing. I use `--no-install-recommends` to avoid superfluous packages. You should decide what you need for your install.

    ```
    apt-get install --no-install-recommends \
        network-manager net-tools wireless-tools wpagui \
        tcpdump wget openssh-client \
        blackbox xserver-xorg-core xserver-xorg x11-xserver-utils \
    	xinit xterm \
        pciutils usbutils gparted nano
    ```

1. **<span class="warning">chroot</span>**

    Create an `/etc/fstab` file for the install.

    We can generate it with a script like so.

    ```
    UUID=`blkid -s UUID -o value /dev/sdz1`
    ```
    ```
    echo "UUID=${UUID} / ext4 defaults 1 1" > /etc/fstab
    ```

1. **<span class="warning">chroot</span>**

    Install the grub bootloader.

    ```
    apt-get install grub2
    ```

    When prompted, be sure to choose `/dev/sdz` (**not** `/dev/sdz1`) as the `Grub install device`.

1. **<span class="warning">chroot</span>**

    Set the root password.

    ```
    passwd root
    ```

1. **<span class="warning">chroot</span>**

    ```
    exit
    ```

1. Reboot to your Debian installation!
