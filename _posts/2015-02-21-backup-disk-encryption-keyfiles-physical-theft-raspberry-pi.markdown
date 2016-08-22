---
layout: post
title: "Backup, Disk Encryption, Keyfiles, Physical Theft, and the Raspberry Pi"
date: 2015-02-21 01:40:57 -0600
comments: true
categories:
---

### Backup Servers and Security

I am the IT manager for my family.  I'm in charge of all laptop/desktop upgrades and often help in any technology purchasing decisions.  As the head of IT, I also feel a sense of responsibility for making sure everyone's data is backed up.  A paid service like DropBox or OneDrive may be nice and reliable, if expensive, but I have several Raspberry Pi's sitting around, so why not put them to good use?

At each location where I have data to backup, I have a Raspberry Pi (horcrux) acting as a backup server.

    Location 1    Location 2    Location 3
    ==========    ==========    ==========
    [horcrux1]    [horcrux2]    [horcrux3]

Each horcrux is housing backups for computers on their local network.

        Location 1              Location 2                  Location 3
        ==========              ==========                  ==========
         |      |                |      |                  /    |     \
    [desktop] [horcrux1]    [laptop] [horcrux2]    [laptop] [horcrux3] [desktop]

The horcruxes are all kept in sync and share their backup data with eachother.  So if there is a fire at `Location 3`, the backup data is still safely stored at `Location 1` and `Location 2`.

The `desktop` at `Location 1` can back up to `horcrux1` very quickly since they are on the same network, and when the desktop is powered off the horcrux can continue syncing data to the rest of the network.

There is a problem, however.  I am concerned about sensitive documents on these machines.  A Raspberry Pi and the hard drive attached to it only weigh about 1 pound and it would be easy for someone to walk off with it.  How can I ensure the contents of these backup devices are safe if they are stolen?

<!-- more -->

### Disk encryption
Full disk encryption is great.  If your computer is ever stolen, it's comforting to know that your important information (taxes, journals, sensitive documents, etc) will be secure from prying eyes.

Full disk encryption is used by businesses, governments, and personal users like you and I who want to know our data is as safe in the same way we might lock sensitive documents in a filing cabinet or a safe.

It is sometimes said that convenience and security are opposing ideas.  If something is more secure, then it may be less convenient, and vice versa.

Typing a password into each of my horcruxes to unlock their encrypted disks may be a pain.  If `Location 1` has a power outage or needs a reboot, do I really want to drive out there and type in a password in order to mount my encrypted disk?

I could use SSH to connect to the machine and type the password, but now I have the overhead of maintaining static IP addresses or dynamic DNS clients, and SSH is just another vulnerability to be exploited allowing an outsider to access that machine.

So, how can I get around that password requirement for my encrypted disks?  I know!

### Keyfiles

Keyfiles are a nice way around needing a password to mount an encrypted drive.  A keyfile can act in a number of different ways, but for simplicity, let's think of it as a text file where the password is stored.  There is already an advantage here, a keyfile can contain a very strong password since we need not commit it to memory.  We could have a text file with a string of characters over 1,000 long acting as our password.  Not only that, but we avoid the risk of forgetting the password.

With those conveniences come some tradeoffs.  How do we keep the key secure?  How do we back it up reliably?

[There](http://ubuntuforums.org/showthread.php?t=837416) are a [number of](http://security.stackexchange.com/questions/44081/how-does-a-key-file-increase-the-security-of-a-password-manager) [articles](https://wiki.archlinux.org/index.php/Dm-crypt/Device_encryption#Keyfiles) [out in the ether](http://superuser.com/questions/22604/keepass-use-a-key-file-or-a-regular-password) that [explain how](https://www.encsec.com/blog/9-company-news/encsec-articles/104-password-encryption-versus-key-file-encryption) to use keyfiles with various encryption systems, and a number of interesting discussions on the merits of keyfiles vs, or in addition, to using a password.

A keyfile may be very convenient, but if not used properly, it can render your disk encryption moot.  Where do you store your keyfile?  On the same computer that is mounting the physical disk?  That sort of defeats the purpose because if someone physically steals your computer they have the keys to the castle.  It's like having an armored car but you leave key in the front door.

A keyfile could be kept on a USB drive.  You could connect that USB drive on boot so that the keyfile is read and the encrypted disk is unlocked, but now I have almost as much hassle as if I was typing in my password at each location.  I still must physically be at that location to insert that USB drive if needed, or if the USB drive is with the horcrux, then it's just as likely to be stolen.

I want the convenience of a keyfile, but also the peace of mind from knowing that if someone steals my horcrux that it's data will be secure.

### Local Key + Remote Key
One solution I've recently implemented that somewhat assuages that fear is to use two keyfiles.  One keyfile is local on the device, and one is remote on the public Internet.  I concatenate the keys together to lock and unlock the drive.

    [horcrux1]   -------------   [Server on the public Internet]
        |                                       |
    [Keyfile part A]                     [Keyfile part B]

If someone steals the device, I can delete the public key file so that I've essentially revoked that encryption key.  And because half of the key is on device, it doesn't matter if someone has the copy on the public Internet because without having physical device access they have nothing.

Now, if someone were to steal my horcrux and I was unaware, then they could potentially boot it up and figure out where that key lives on the Internet.  They could get that key and I would be screwed.

I'm willing to take that risk, however, because I feel that the odds are very slim of someone breaking into my home, stealing my horcrux, figuring out it's encrypted, figuring out where the keyfile lives online, all before I figure it out and revoke the keyfile on the public Internet.

### Healthy Paranoia

This may be a little on the paranoid side, and there are certainly flaws with this model, but I feel that having a local and remote key for disk encryption is the only reliable way to use a convenient keyfile and still maintain security if the device is physically stolen.

I think it's worthwhile considering how much of my life is stored digitally.
