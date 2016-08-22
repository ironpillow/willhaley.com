---
title: "Encrypted Core Storage Home Folder on Mac OSX"
slug: encrypted-core-storage-home-folder-on-mac-osx
date: 2016-11-12 10:23:51
---

So you want to encrypt your `$HOME` on your Mac but nothing else?

Let's stop right here.

**The built in option for FileVault full disk encryption is the standard on a Mac, and I recommend going that route for encryption. It is a fairly big pain to do what you're asking.**

Though, it is possible, and that is what this guide will help you to accomplish. Although it is complicated, it _is_ possible to encrypt a user's home folder independently of the rest of the system. We can use a keyfile to encrypt our home, and automatically mount it at boot.

A couple caveats.

1. Again, I have to stress, FileVault is *so much* simpler. Or [VeraCrypt](https://en.wikipedia.org/wiki/VeraCrypt).
1. You must be comfortable using a USB key to decrypt your drive.
1. My process works 99% of the time, but about once every few months my `$HOME` fails to mount properly and I must reboot to try again.

Full disk encryption is better than partial disk encryption, and my process certainly has some holes. It is up to you to be as secure (paranoid) as you want.

<!-- more -->

## Administrator account

Create an `Administrator` user on your Mac (with Administrator access of course) and log out of your account and log in as that user.

While it may be possible, I do not think it's a good idea to mess with the home folder of a user while that user is logged in. That is why I ask you to create the Administrator user account.

Not only should you use that secondary account to follow these instructions, but you should keep that account around and **never encrypt its home**.

Why? Well, if your encrypted home folder fails to mount at boot time for some reason, you may be locked out of your Mac. That's no fun. You can probably fix things via the recovery tools if that happens, but having a secondary admin account will greatly ease your burden if you need to troubleshoot. It's your choice, but be warned, if something goes wrong and you get locked out of your machine, it will probably be very frustrating and annoying.

## Create a keyfile

I believe that a keyfile is the only way to accomplish the goal of this article.

I cannot find any way to accomplish our goal using a password prompt. I don't think you can inject/prompt for a password in the standard boot process without using a file that can be read via script.

I am naming my keyfile `willencryptedhome.key`. The file should contain nothing but the password.

```
thePassw0rd
```

That is a trivial example. In reality, this is how I generated my keyfile.

```
# 1023 chars is the longest allowed passphrase here.
cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 1023 | head -n 1 > willencryptedhome.key
```

Find a USB drive. Bonus points if it has a ["read only" switch on it like the Kanguru USB drives that I use](https://www.amazon.com/Kanguru-Flash-Physical-Protect-switch/dp/B008OGNM8E).

Format the USB drive as MS-DOS (FAT), with a Master Boot Record, using Disk Utility. Name the drive `KEYDRIVE01` or something that's reasonably unique.

Copy your keyfile to the root of `KEYDRIVE01`.

You should backup this keyfile somewhere secure. If you lose it, you will forever lose access to your encrypted disk.

## Set up our encrypted disk

I highly recommend using a dedicated disk to house this encrypted home of yours. What I mean is, a separate, distinct disk from your OS disk.

In my case, I'm using a brand new ~500GB SSD drive to act as my encrypted home.

For clarity, I'm going to refer to this disk as the "encrypted home", even though it's not encrypted just yet.

With your machine powered off, plug in your new encrypted home disk to your Mac. Boot up and open up your terminal.

Find the id of the disk that will server as your encrypted home.

```
diskutil list
```

My encrypted home disk is brand new and so has no partitions.

```
/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:                                                   *480.1 GB   disk0
... etc ...
```

Be **extremely** certain that you're looking at the correct disk before proceeding. If you choose the wrong disk, you may lose data.

Create a `corestorage` `Logical Volume Group` on your encrypted home disk. **Warning: this will erase the disk.** Note that I am running this command against `/dev/disk0` based on the output of the command above. This will almost certainly **not** be the same for you, so read carefully!

I am using `ENCRYPTEDHOME` for the Core Storage logical volume group name, but you use whatever you like.

```
diskutil corestorage create ENCRYPTEDHOME /dev/disk0
```

Your encrypted home disk layout should look something like this if you do another `diskutil list`.

```
/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *480.1 GB   disk0
   1:                        EFI EFI                     209.7 MB   disk0s1
   2:          Apple_CoreStorage ENCRYPTEDHOME           479.8 GB   disk0s2
   3:                 Apple_Boot Boot OS X               134.2 MB   disk0s3
... etc ...
```

Create a volume inside the Core Storage `Logical Volume Group` that we just created a moment ago. I am calling *my* volume `WILLENCRYPTEDHOME`. You can name it however you like, but then make sure you use _your_ updated name(s) in the rest of my steps.

```
diskutil corestorage createVolume ENCRYPTEDHOME jhfs+ WILLENCRYPTEDHOME 100%
```

Encrypt your encrypted home disk Core Storage volume using the key we created earlier.

```
cat /Volumes/KEYDRIVE01/willencryptedhome.key|diskutil corestorage encryptVolume WILLENCRYPTEDHOME -stdinpassphrase
```

## Unlock our encrypted disk at boot

Great. Now we have an encrypted drive and a USB key to unlock it, but how do we unlock it at boot when we need to login? OS X has no built in mechanism for this, so we'll have to script it ourselves.

Technically, we can't unlock the drive as part of the login process. At least, not to my knowledge. So, we must unlock the disk at boot time. We'll unlock it then using our USB key.

Get the UUID of your USB key.

```
wills-iMac:~ will$ diskutil list | grep KEYDRIVE01
1:                  Apple_HFS KEYDRIVE01              1.9 GB     disk4s1
wills-iMac:~ will$ diskutil info disk4s1 | grep "Volume UUID"
Volume UUID:              35B0AB1F-AF54-3A8B-8C95-8DA9833CB0E1
```

Get the UUID of your encrypted `Logical Volume`. Note, it's the last item in the list.

```
wills-iMac:~ will$ diskutil corestorage list | grep "Logical Volume"
+-- Logical Volume Group C3E498E5-BADE-4367-9979-D6E541D37989
    +-> Logical Volume Family 7E96AFD1-3B18-4C48-8537-8491B35DF73A
        +-> Logical Volume 0C4997C8-EE93-4723-813F-D60A50872B60
```

Create a file with the following contents at `/opt/mount.sh`.

**Replace `YOUR_USB_KEY_UUID` and `YOUR_ENCRYPTED_VOLUME_UUID` in the script below with the correct UUIDs for *your* USB key and encrypted volume found when you ran the commands above!**

Modify the script as needed for your system. For instance, your keyfile probably has a different file name than mine.

```
#!/bin/bash

USB_KEY_UUID=YOUR_USB_KEY_UUID
ENCRYPTED_VOLUME_UUID=YOUR_ENCRYPTED_VOLUME_UUID

LOG=/tmp/mount.log

echo "mount attempted at $(date)" > $LOG 2>&1

# Must ensure the USB key is mounted so we can access the keyfile.
diskutil mount $USB_KEY_UUID >> $LOG 2>&1

diskutil list >> $LOG 2>&1

KEY_NAME=$(diskutil info $USB_KEY_UUID | grep "Volume Name" | awk '{print $3}')

echo $KEY_NAME >> $LOG 2>&1

# Read the key.
password=$(cat /Volumes/$KEY_NAME/willencryptedhome.key)

# Mount encrypted volume using the key.
printf $password|diskutil corestorage unlockVolume $ENCRYPTED_VOLUME_UUID -stdinpassphrase
```

Lock that script down a bit and make it executable.

```
sudo chown root:wheel /opt/mount.sh
sudo chmod 500 /opt/mount.sh
sudo chmod +x /opt/mount.sh
```

OK, so how do we get that to run at boot?

Create a file at `/Library/LaunchDaemons/com.willhaley.mac.startup.mounthome.plist` using these contents.

Again, you can rename that file if you want, but make sure you update the name appropriately elsewhere!

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>RunAtLoad</key>
    <true />
    <key>Label</key>
    <string>com.willhaley.mac.startup.mounthome</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/mount.sh</string>
    </array>
</dict>
</plist>
```

Set our mount script to run at boot.

```
launchctl load -w /Library/LaunchDaemons/com.willhaley.mac.startup.mounthome.plist
```

Now comes the ultimate test. Keep your USB key plugged in, and reboot. Log in as any user and verify that you can see your mounted drive in the Finder.

Create a new folder in your encrypted volume. Reboot.

Do you see your folder in the encrypted drive? Great. Data is persisting as we'd hope.

Try unplugging your USB key and rebooting. You should see that the encrypted home disk does _not_ mount now. Re-connect your USB key and reboot again.

Hopefully the encrypted home disk is mounting properly each time you reboot as long as the USB key is plugged in.

If your encrypted home is failing to mount automatically, take a step back and try to see where you went wrong.

Can you run the `mount.sh` script manually? Do you see any errors? Do you see a file created at `/tmp/mount.log` indicating that a mount was even attempted? Keep at it. I'm sure you'll figure it out, and my apologies if I left out a step.

## Move your $HOME data to the encrypted disk

You may not have paid attention at the beginning, but to reiterate, I **highly** recommend that you log out of your account and log in as another administrator for these next steps.

Once you have logged in as another user, we can copy data from your old unencrypted home directory to the new encrypted home location.

```
rsync -avr /Users/will/ /Volumes/WILLENCRYPTEDHOME/
```

# Mount your encrypted disk as your new $HOME

Our encrypted volume should mount automatically at boot now, but you'll note it's mounted under `/Volumes` by default. We do not want that. We want it mounted at `$HOME`. Although it's possible to re-define where `$HOME` is, or do a mount bind, I am not entirely comfortable messing with those. I feel like that would be very non-standard and may not play well on a Mac.

So instead, we will mount the encrypted home disk over our standard `/Users/$USER` path.

Let's go back and edit our `/opt/mount.sh` script. We have a couple more lines to add.

At the bottom, add these lines so that from now on, your encrypted home volume will mount at `/Users/will` (or whatever is applicable).

```
# This looks odd, but I've found that occasionally it fails to unmount the first
# time, so adding a loop so we can re-try.
MAX_ATTEMPTS=10
ATTEMPT=0
while [ "$(diskutil info $ENCRYPTED_VOLUME_UUID | grep -i "Mounted" | awk '{print $2}')" == 'Yes' ] && [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  sleep 1
  echo "$ENCRYPTED_VOLUME_UUID is mounted. Attempt: $ATTEMPT of $MAX_ATTEMPTS" >> $LOG 2>&1
  diskutil umount $ENCRYPTED_VOLUME_UUID >> $LOG 2>&1
  ATTEMPT=$((ATTEMPT+1))
done

diskutil mount -mountPoint /Users/will $ENCRYPTED_VOLUME_UUID >> $LOG 2>&1
```

Reboot again. Your machine should now be using the encrypted volume as your `/Users/will` folder.

## Clean up

Once you're satisfied and your data is backed up securely and your USB key is backed up securely, then you should **delete** your old home directory at `/Users/will` (or wherever) from the unencrypted disk.

After all, what is the point of encrypting our `$HOME` if the old unencrypted data is still there in the open?

**Be extremely careful that you are deleting the data from the unencrypted disk, and not from your encrypted disk.**

These steps took a _lot_ of trial and error. FileVault is a much safer and easier way to get encryption, and although I have not used VeraCrypt, it is probably much simpler too.

For any of this to be worthwhile, please don't leave your USB key plugged in to your Mac when you leave the house ;)

## Citations

[This site](https://derflounder.wordpress.com/2011/11/23/using-the-command-line-to-unlock-or-decrypt-your-filevault-2-encrypted-boot-drive/) was a huge help in understanding Core Storage.

[This site](http://www.splinter.com.au/using-launchd-to-run-a-script-every-5-mins-on/) was a huge help in understanding `Launchd` and boot scripts in OS X.
