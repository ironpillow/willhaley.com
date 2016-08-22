---
title: "Simple Portable Linux QEMU VM on a USB Drive"
date: 2015-04-19 20:46:25
disqus: true
---

Create a Linux virtual machine that can run on a Windows, Linux, or Mac OSX host. The VM can be moved around on a USB drive or even synced via DropBox between machines.

<!-- more -->

# OS: Tiny Core Linux

Tiny Core Linux is small and simple. Its size makes it the perfect guest OS for this project.

Create a directory called `tc` to store all the files for this project.

Let's grab the [latest Tiny Core Linux iso](http://distro.ibiblio.org/tinycorelinux/downloads.html).

Once it is downloaded extract the `vmlinuz` and `core.gz` files from the `iso` to our `tc` folder. You can do this by mounting the `iso` or opening it in some sort of archive manager like [7-zip](http://www.7-zip.org/) and copying the files out.

You should now have these files in the `tc` directory.

```
vmlinuz
core.gz
```

Those files are our kernel and initramfs, respectively.

# VM Platform: QEMU

There are no official [QEMU](http://wiki.qemu.org/Main_Page) builds for Windows, but there are [a number of unofficial builds](http://wiki.qemu.org/Links#Unofficial_QEMU_binaries).

I found that the [builds by Eric Lassauge](http://lassauge.free.fr/qemu/QEMU_on_Windows.html) seemed the best for what I want to accomplish with this project. Download the latest Qemu Windows build `zip` file (2.2.0 at the time this was written) from his website.

The most important reason I am going to suggest using the "lassauge builds" for this project is that the **files are entirely portable**. No installation of any sort is required on Windows. Download and copy the QEMU files to our `tc` directory and you will have a simple, portable, working VM platform for Windows.

Your `tc` directory should look like this now.

```
Qemu-2.2.0-windows
vmlinuz
core.gz
```

There are a number of `qemu-system-*.exe` files in `Qemu-2.2.0-windows` that you do not need. You can safely delete all of them except for `qemu-system-i386.exe`.  That is the only binary we need to run our VM. Deleting the other system binaries will save us a lot of space.

On Linux, QEMU should be installable through your preferred package manager. On OSX, you should be able to use something like [brew](http://brew.sh/) to install QEMU as easily as you could on Linux.

# Create Virtual Hard Drive

Let's create a hard disk for our VM.  You may use the `qemu-img` command that QEMU provides. This binary will either be in the `Qemu-2.2.0-windows` directory we extracted if you're on Windows, or it should be installed system-wide if you're using QEMU on a Mac or Linux host.

```
qemu-img create -f vpc tc.vhd 4G
```

That command should generate a 4GB sparse virtual hard disk file. The disk should only be a few KB large initially, but has the ability to grow up to 4GB.  You can use whatever size or file format you prefer for the disk image, but I prefer `vhd` since Windows can natively handle that format as an added bonus.

Your `tc` directory should look like this now.

```
Qemu-2.2.0-windows
vmlinuz
core.gz
tc.vhd
```

# Run it!

Now we can start our VM. You may prefer to script this so you don't have to memorize the command.

### Windows

```
Qemu-windows-2.2.0\qemu-system-i386 -L Qemu-windows-2.2.0\Bios -m 1024 -kernel vmlinuz -initrd core.gz -hda tc.vhd -append "home=sda1 opt=sda1 tce=sda1"
```

### OSX or Linux

```
qemu-system-i386 \
    -m 1024 \
    -kernel vmlinuz \
    -initrd core.gz \
    -hda tc.vhd \
    -append "home=sda1 opt=sda1 tce=sda1"
```

On Windows only, we need to specify the absolute path to the QEMU VM executable, and the `-L` flag is needed to specify the path to our QEMU `Bios` files (incuded with QEMU).

Regardless of the OS, we specify which file is our kernel, which is our initramfs, what to use as the primary hard drive, and finally, we pass some additional boot options to Tiny Core specifying where our `home`, `opt`, and `tce` directories live.

# Format Virtual Hard Drive

**Warning: You must run these commands _inside_ the QEMU VM. If you run these commands on your host machine you may damage your system!**

After you boot to the VM using the commands above, format the disk.

You can run these steps manually, but I am showing this single command to format the entire virtual hard drive.

```
printf "o\nn\np\n1\n\n\nw\n" | sudo fdisk /dev/sda
```

Next, create an `ext4` filesystem on our newly created partition.

```
sudo mkfs.ext4 /dev/sda1
```

Then reboot so that Tiny Core can use that disk.

```
sudo reboot
```

# Done

At this point, you should be done, and just need to install packages to customize your VM as you see fit.

# Qemu tips

Here are some neat things you can do with QEMU.

```
# Port forwarding, some ports require elevated permissions on your host.
-redir tcp:80::80 -redir tcp:8000::8000
```

```
# Create a "shrunken" copy of your VHD file.
# Remove any reserved space from the sparse disk.
qemu-img convert -O vpc tc.vhd tc.vhd.copy
```

Qemu has an awesome way to let you access just about any virtual hard disk using the "Network Block Device" protocol.  This will work on a *nix system only.

```
sudo modprobe nbd max_part=16
sudo qemu-nbd -c /dev/nbd0 /path/to/tc/tc.vhd
sudo mount /dev/nbd0p1 /mnt/
```

`10.0.2.2` is an IP address that can be used to access your host VM from within the QEMU guest.

# Tiny Core tips

```
# Change the label of a partition to something like "hd01"
sudo tune2fs /dev/sda1 -L hd01
```

```
# Mount persistent partitions by label
tce=LABEL=hd01
```

```
# Specify an ISO image to mount when running the QEMU VM
-cdrom /path/to/file.iso
```

# Citations

* http://distro.ibiblio.org/tinycorelinux/corebook.pdf
* http://distro.ibiblio.org/tinycorelinux/faq.html
* https://computerramblings.wordpress.com/
* http://computerramblings.wordpress.com/tiny-core-linux-wordpress-server-howto/
