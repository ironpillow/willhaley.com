---
title: "Unlock LUKS Encrypted Volumes at Boot With a USB Key"
slug: unlock-luks-volumes-with-usb-key
date: 2016-12-28 11:25:22
---

You can automatically unlock and mount LUKS encrypted volumes at boot by specifying the volumes and their keys in `/etc/crypttab`.

For the sake of this article, I am working with non-critical volumes. Volumes for storage. Not volumes required to boot your machine properly. I am not discussing how to mount an encrypted root volume.

I like to keep my keyfiles on USB drives. You do not _need_ to use a USB device to unlock your volumes, but it is a bit silly to keep the key on a permanent disk connected to your machine, right?

You can specify an `/etc/fstab` entry for your USB key like so.

```
# /etc/fstab
UUID=1ed7fee7-0ea5-4643-bb0c-a4937da77a3f	/mnt/key	ext4	defaults,nofail,x-systemd.device-timeout=1
```

It is less a recommendation, and more a requirement, that you mount the key using a UUID or some other less flexible identifier. Names like `/dev/sdc1` can vary wildly for a USB device.

I specify `nofail` and `x-systemd.device-timeout` because I consider my encrypted volume non-critical. It is a secondary volume. So if I forget to put my USB key in my computer, it is fine. It will timeout after `1` second and boot normally. Without these settings, your computer will hang at boot forever or for a very long time if you forget to connect your USB key before booting.

> nofail
>> The system will not wait for the device to show up and be unlocked at boot, and not fail the boot if it does not show up.

> x-systemd.device-timeout=
>> Configure how long systemd should wait for a device to show up before giving up on an entry from /etc/fstab. Specify a time in seconds or explicitly append a unit such as "s", "min", "h", "ms".

Now we can specify in `/etc/crypttab` which encrypted volume(s) to mount at boot, and where the keyfiles are.

```
# /etc/crypttab
storage1	UUID=d719b16d-d9e3-4a7d-97f4-661bc7904a69	/mnt/key/mykey.keyfile	luks,nofail
```

Note above. I have an encrypted volume identified by a UUID that will be opened using the name `storage1`. The keyfile used to unlock that volume lives at `/mnt/key/` and is named `mykey.keyfile`. `nofail` indicates that this is not a critical drive, and if a failure occurs, booting should continue normally.

There is a bit of a catch here. `/etc/crypttab` is processed _before_ `/etc/fstab`. So `/mnt/key` will not be available at the right time.

To get around that, we create `/etc/cryptdisks` like so.

```
# /etc/default/cryptdisks
CRYPTDISKS_MOUNT='/mnt/key'
```

This tells the crypt software to mount `/mnt/key` before processing `/etc/crypttab`.

With all that in place, when you reboot, the volume should be available, unencrypted, at `/dev/mapper/storage1`.

A standard `/etc/fstab` entry to mount that unencrypted device to a standard location can be done as you would for any other unencrypted volume.

```
# /etc/fstab
/dev/mapper/storage1	/mnt/storage1	ext4	defaults,nofail	0	1
```
