---
title: "Unlock Veracrypt Encrypted File Container at Boot"
slug: unlock-veracrypt-boot
date: 2017-11-08 18:26:00
---

_These steps were tested on Ubuntu 17.04._

Create a 1 GiB veracrypt file container volume. Name it whatever you like. In my case, I am naming it `veracrypt.img`, formatting it as `ext4`, and saving it at `/veracrypt.img`. Note that this is not an especially secure setup, but rather, meant to demonstrate the basics.

Create a key file. In my case, I am creating a simple file at `/key.file` with the following text.

```
abc123 the password!
```

Install `cryptsetup` if you have not done so already.

```
apt-get install cryptsetup
```

Test unlocking your disk using `cryptsetup` on the command line.

```
sudo cryptsetup open \
	/veracrypt.img \
	--type tcrypt \
	--veracrypt \
	--key-file /key.file \
	veracrypt
```

If that works, you should see an entry in `/dev/mapper` named `veracrypt`.

You can now confidently create an entry at `/etc/crypttab` to automatically unlock the volume at boot.

There are many potential [options](https://www.freedesktop.org/software/systemd/man/crypttab.html) for Veracrypt in `crypttab`, but these worked for me.

```
# /etc/crypttab
veracrypt /veracrypt.img /dev/null tcrypt-veracrypt,tcrypt-keyfile=/key.file
```

A corresponding `/etc/fstab` file can then mount your volume wherever you would like.

```
# /etc/fstab
/dev/mapper/veracrypt /mnt/veracrypt ext4 nofail 0 2
```
