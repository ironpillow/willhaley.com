---
layout: post
title: "Encrypted Home Folder on Mac OSX"
date: 2015-10-29 19:15:47 -0500
comments: true
# Seems like machine only *sometimes* boots with the encrypted
# disk mounted properly. Better to un-publish this for now.
published: false
categories:
---

The built in option for FileVault full disk encryption is the standard on a Mac, and I recommend going that route for encryption, but I also want to illustrate that it is possible to encrypt a user's home folder independently of the rest of the system.

Full disk encryption is better than partial disk encryption, and my process certainly has some holes. It is up to you to be as secure (paranoid) as you want. I just want to protect against someone stealing my computer and being able, with relative ease, to see all of my data.

*Note, for that scenario to be worthwhile, please don't leave your USB key plugged in to your Mac when you leave the house ;)*

<!-- more -->

**While it may be possible, I do not think it's a good idea to mess with the home folder of a user while that user is logged in. If you do not already have an additional *Administrator* account on your Mac, create one. Log out, and log in as that user to proceed.**

Not only should you use that secondary account to follow these instructions, but you should keep that account around and **not encrypt it, ever**. Why? Well, if your encrypted home folder fails to mount at boot time, you're locked out of your Mac. That's no fun. You can probably fix things via the recovery tools if that happens, but having a secondary admin account will greatly ease your burden if you need to troubleshoot. It's your choice, but be warned, if something goes wrong and you get locked out of your machine, it will be annoying.

## Setup our encrypted disk and key

Choose a disk to house your encrypted home folder. In my case, I'm using a brand new ~500GB SSD drive as my disk. I plan to use this entirely for my primary user account alone. If you plan to use this disk for multiple users/partitions, you're on your own as I do not cover that.

Connect your target "home" disk to your Mac and open up your terminal.

Find the id of the disk.

    diskutil list

My disk has no partitions.

    /dev/disk0 (internal, physical):
       #:                       TYPE NAME                    SIZE       IDENTIFIER
       0:                                                   *480.1 GB   disk0
    ... etc ...

Be **extremely** certain that you're looking at the correct disk before proceeding. If you choose the wrong disk, you will lose data.

Create a `corestorage` volume on that disk. **Warning: this will erase the disk.** Note that I am running this command against `/dev/disk0` based on the output of the command above. This will almost certainly **not** be the same for you, so read carefully!

I am using `ENCRYPTEDHOME` for the corestorage name, but you use whatever you like.

    diskutil corestorage create ENCRYPTEDHOME /dev/disk0

Your disk layout should look something like this if you do another `diskutil list`.

    /dev/disk0 (internal, physical):
       #:                       TYPE NAME                    SIZE       IDENTIFIER
       0:      GUID_partition_scheme                        *480.1 GB   disk0
       1:                        EFI EFI                     209.7 MB   disk0s1
       2:          Apple_CoreStorage ENCRYPTEDHOME           479.8 GB   disk0s2
       3:                 Apple_Boot Boot OS X               134.2 MB   disk0s3
    ... etc ...

Create a volume in our corestorage `Logical Volume Group`. I am calling *my* volume `WILLENCRYPTEDHOME`. You use whatever you like, but make sure you replace that appropriately in the following steps.

You could use UUIDs instead of LABELs like I'm doing here. UUIDs are safer in case you have multiple volumes with the same name, but this is good enough for me. We'll use UUIDs when we mount.

    diskutil corestorage createVolume ENCRYPTEDHOME jhfs+ WILLENCRYPTEDHOME 100%

Create a key file for encryption. I am naming mine `willencryptedhome.key`.

    # willencryptedhome.key file
    # This is a trivial example.
    thePassw0rd

In reality, this is how I generated my key file.

    # 1023 chars is the longest allowed passphrase here.
    cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 1023 | head -n 1 > willencryptedhome.key

Find a USB drive. Bonus points if it has a "read only" switch on it. Format it using Disk Utility and name the drive `KEYDRIVE01` or something that's reasonably unique. Copy your key file on to it.

Encrypt the volume using the key we just created.

    cat /Volumes/KEYDRIVE01/willencryptedhome.key|diskutil corestorage encryptVolume WILLENCRYPTEDHOME -stdinpassphrase

You should backup this key file somewhere secure. If you lose it, you will forever lose access to your encrypted disk.

## Unlock our encrypted disk at boot

Great. Now we have an encrypted drive and a USB key to unlock it, but how do we unlock it at boot when we need to login? OS X has no built in mechanism for this, so we'll have to script it ourselves.

Technically, we can't unlock the drive as part of the login process. At least, not to my knowledge. So, we must unlock the disk at boot time. We'll unlock it then using our USB key.

Get the UUID of your USB key.

    wills-iMac:~ will$ diskutil list | grep KEYDRIVE01
    1:                  Apple_HFS KEYDRIVE01              1.9 GB     disk4s1
    wills-iMac:~ will$ diskutil info disk4s1 | grep "Volume UUID"
    Volume UUID:              35B0AB1F-AF54-3A8B-8C95-8DA9833CB0E1

Get the UUID of your encrypted `Logical Volume`.

    wills-iMac:~ will$ diskutil corestorage list | grep "Logical Volume"
    +-- Logical Volume Group C3E498E5-BADE-4367-9979-D6E541D37989
        +-> Logical Volume Family 7E96AFD1-3B18-4C48-8537-8491B35DF73A
            +-> Logical Volume 0C4997C8-EE93-4723-813F-D60A50872B60

Create a file with these contents at `/opt/mount.sh`.

**Replace `YOUR_USB_KEY_UUID` and `YOUR_ENCRYPTED_VOLUME_UUID` in the script below with the correct UUIDs for *your* USB key and encrypted volume found when you ran the commands above!**

Modify the script as needed for your system. For instance, your key file probably has a different file name than mine.

[Citation](https://derflounder.wordpress.com/2011/11/23/using-the-command-line-to-unlock-or-decrypt-your-filevault-2-encrypted-boot-drive/)

```
#!/bin/bash

USB_KEY_UUID=YOUR_USB_KEY_UUID
ENCRYPTED_VOLUME_UUID=YOUR_ENCRYPTED_VOLUME_UUID

LOG=/tmp/mount.log

echo "mount attempted at $(date)" > $LOG 2>&1

# Must ensure the USB key is mounted so we can access the key file.
diskutil mount $USB_KEY_UUID >> $LOG 2>&1

diskutil list >> $LOG 2>&1

KEY_NAME=$(diskutil info $USB_KEY_UUID | grep "Volume Name" | awk '{print $3}')

echo $KEY_NAME >> $LOG 2>&1

# Read the key.
password=$(cat /Volumes/$KEY_NAME/willencryptedhome.key)

# Mount encrypted volume using the key.
printf $password|diskutil corestorage unlockVolume $ENCRYPTED_VOLUME_UUID -stdinpassphrase
```

Lock that script down a bit.

```
sudo chown root:wheel /opt/mount.sh
sudo chmod 500 /opt/mount.sh
sudo chmod +x /opt/mount.sh
```

OK, so how do we get that to run at boot?

[Citation](http://www.splinter.com.au/using-launchd-to-run-a-script-every-5-mins-on/).

Create a file at `/Library/LaunchDaemons/com.willhaley.mac.startup.mounthome.plist` using these contents.

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

Set it to run at boot.

```
launchctl load -w /Library/LaunchDaemons/com.willhaley.mac.startup.mounthome.plist
```

Now comes the ultimate test. Keep your USB key plugged in, and reboot. Log in as any user and verify that you can see your mounted drive in the Finder. Try to make a folder. Reboot.

Do you see your folder in the encrypted drive? If so, congratulations.

If not, take a step back and try to see where you went wrong. Can you try running the `mount.sh` script manually? Do you see any errors? Do you see a file created at `/tmp/mount.log` indicating that a mount was even attempted? Keep at it. I'm sure you'll figure it out, and my apologies if I left out a step.

## Move your $HOME data to the encrypted disk

You may not have paid attention at the beginning, but to reiterate, I **highly** recommend that you log out of your account and log in as another administrator for these next steps.

Once you have logged in as another user, we can start copying data to the new home location.

```
rsync -avr /Users/will/ /Volumes/WILLENCRYPTEDHOME/
```

# Mount your encrypted disk at your path to $HOME

Let's go back and edit our `/opt/mount.sh` script. We have a couple more lines to add.

At the bottom, add these lines so that from now on, your encrypted home volume will mount at `/Users/will` (or whatever is applicable)`.

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

Once you're satisfied and your data is either backed up securely, or your USB key is backed up securely, then you should **delete** your old home directory at `/Users/will` (or wherever) from the unencrypted disk. **Be extremely careful that you are deleting the data from the unencrypted disk, and not from your encrypted disk.**

There's not much point in using an encrypted home directory if you leave the unencrypted data sitting there in the open.
