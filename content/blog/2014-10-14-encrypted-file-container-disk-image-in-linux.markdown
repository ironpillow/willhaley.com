---
title: "LUKS Encrypted File Container (Disk Image) On Linux"
slug: encrypted-file-container-disk-image-in-linux
date: 2014-10-14 17:28:55
lastmod: 2017-10-27 09:35:00
disqus: true
---

These instructions can be used to create an encrypted disk image/volume/file container/whatever you want to call it.

I will show you how to use `cryptsetup` and common Linux commands to create a disk image, create a random keyfile, and encrypt and unlock your disk image with that keyfile.  You can just as easily use a passphrase rather than a key if you would prefer.  Read a [cryptsetup manual](http://man.cx/cryptsetup%288%29) for more information regarding cryptsetup.

<!-- more -->

Create the image container file. Use the `seek` value to specify the size.  Here I am creating an empty 1GB `img` file. The image file can behave very much like a physical disk would.

```
dd \
	if=/dev/zero \
	of=encrypted.img \
	bs=1 \
	count=0 \
	seek=1G
```

Choose a keyfile that will be used to encrypt and unlock the image. You can use an existing file like a photo, an mp3, or any other file. I am creating a long random keyfile. You can name it whatever you want.

```
dd \
	if=/dev/urandom \
	of=mykey.keyfile \
	bs=1024 \
	count=1
```

Now we will encrypt our disk image file.  Use `cryptsetup luksFormat` to format `encrypted.img` using our keyfile.

```
sudo cryptsetup \
	luksFormat \
	encrypted.img \
	mykey.keyfile
```

**Make sure to type `YES` (uppercase!) when prompted by the command above or your image will not be encrypted.**

Unlock/open the encrypted image using our keyfile. You can use whatever "friendly" name for the image that you want. Here I am using `myEncryptedVolume` as the name.

```
sudo cryptsetup \
	luksOpen \
	encrypted.img \
	myEncryptedVolume \
	--key-file mykey.keyfile
```

Format the encrypted volume using an `ext4` filesystem.

```
sudo mkfs.ext4 \
	/dev/mapper/myEncryptedVolume
```

Mount the volume somewhere on your system so it can be used like any other disk.

```
sudo mount \
	/dev/mapper/myEncryptedVolume \
	$HOME/Private/
```

Take ownership over the contents of your mounted disk image.

```
sudo chown \
	-R $USER \
	$HOME/Private/
```

Done! Please read [some documenation](https://wiki.archlinux.org/index.php/Dm-crypt/System_configuration#crypttab) on crypttab if you want your encrypted volume to be unlocked and mounted automatically.

To unmount your encrypted image and close it you can do the following.

```
sudo umount \
	$HOME/Private \
```

```
sudo cryptsetup \
	luksClose \
	myEncryptedVolume
```
