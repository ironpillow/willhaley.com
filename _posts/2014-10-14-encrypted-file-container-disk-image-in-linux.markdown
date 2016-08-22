---
layout: post
title: "Encrypted File Container (Disk Image) On Linux"
date: 2014-10-14 17:28:55 -0500
comments: true
categories: 
---

These instructions can be used to create an encrypted disk image/volume/file container/whatever you want to call it.

I will show you how to use cryptsetup and common linux commands to create a disk image, create a random keyfile, and encrypt and unlock your disk image with that keyfile.  You can just as easily use a passphrase rather than a key if you would prefer.  Read a [cryptsetup manual](http://man.cx/cryptsetup%288%29) for more information regarding cryptsetup.

<!-- more -->

1. Create the image container file.  Use the ```seek``` value to specify the size.  Here I am creating a 1GB large image file.  The image file can behave very much like a physical disk would.

```
dd if=/dev/zero of=encrypted.img bs=1 count=0 seek=1G
```

1. Choose a keyfile that will be used to encrypt and unlock the image.  You can use an existing file like a photo, an mp3, or any other file.  I am creating a long random keyfile.  You can name it whatever you want.

```
dd if=/dev/urandom of=mykey.keyfile bs=1024 count=1
```

1. Now we will encrypt our disk image file.  Use ```cryptsetup luksFormat``` to format ```encrypted.img``` using our keyfile.

```
sudo cryptsetup luksFormat encrypted.img mykey.keyfile
```

**Make sure to type ```YES``` (uppercase!) when prompted by the command above or your image will not be encrypted.**

1. Unlock/open the encrypted image using our keyfile.  You can use whatever "friendly" name for the image that you want.  Here I am using ```myEncryptedVolume``` as the name.

```
sudo cryptsetup luksOpen encrypted.img myEncryptedVolume --key-file mykey.keyfile
```

1. Format the encrypted volume using a standard filesystem.

```
sudo mkfs.ext4 /dev/mapper/myEncryptedVolume
```

1. Mount the volume somewhere on your system so it can be used like any other disk.

```
sudo mount /dev/mapper/myEncryptedVolume ~/Private/
```

1. Take ownership over the contents of your mounted disk image so that you have control over it.

```
sudo chown -R $USER ~/Private/
```

Done!  Please read [some documenation](https://wiki.archlinux.org/index.php/Dm-crypt/System_configuration#crypttab) on crypttab if you want your encrypted volume to be unlocked and mounted automatically.

To unmount your encrypted image and close it you can do the following.

```
sudo umount ~/Private && sudo cryptsetup luksClose myEncryptedVolume
```

