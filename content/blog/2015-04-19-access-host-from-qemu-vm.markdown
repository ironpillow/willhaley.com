---
title: "Access Host from QEMU VM"
slug: access-host-from-qemu-vm
date: 2015-04-19 13:50:27
disqus: true
---

From within a QEMU VM, you can access the host at `10.0.2.2`. This is a [special network address created by Qemu](https://en.wikibooks.org/wiki/QEMU/Networking) as a convenience. It is very helpful if you want a "Shared Folder", similar to what you might use in Virtualbox, in Qemu. This allows us to easily transfer files between the guest and host.

In my case, I am using Windows 7 as the **host** and a live ISO for [Puppy Linux](http://puppylinux.org/) as the **guest**. I am using the 2.5.0 version of [Qemu on Windows](http://lassauge.free.fr/qemu/QEMU_on_Windows.html) built by Eric Lassauge.


Download your Linux ISO somewhere on the **host** machine. In my case, I downloaded it to `C:\linux.iso`.

Download and extract the Qemu files on the Windows **host** machine.

With the required files in place, boot the Qemu VM in Windows using this command (modify it as needed for your environment).

```
qemu-system-i386.exe -L Bios -cdrom C:\linux.iso
```

Ceate a shared folder somewhere on Windows. In my case, I made a shared folder named `share`.

Then, from within the **guest** (as long as `cifs` capabilities are installed), you can mount a share from the **host**. Note that, depending on the permissions of the share, you may need to authenticate as the Windows user to mount the share. In my case the user's name is `Will` and the password is `password`.

```
sudo mount.cifs \
	//10.0.2.2/share \
	/mnt \
	-o user=Will,pass=password
```
