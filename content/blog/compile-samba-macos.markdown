---
title: "Compiling and Running Samba 4 Server on macOS"
date: 2017-11-06 11:06:00
disqus: true
---

The goal of this article is to **compile and run a Samba server on a Mac** using the [open source version of Samba](https://www.samba.org/) instead of Apple's implementation of Samba. We will configure Samba to share both _public_ and _private_ shares.

I should point out that there are _already MacPorts formulas for [Samba 3](https://github.com/macports/macports-ports/blob/master/net/samba3/Portfile) and [Samba 4](https://github.com/macports/macports-ports/blob/master/net/samba4/Portfile)_. Additionally, macOS already ships with an [implementation of smbd](https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man8/smbd.8.html).

Apple's Samba implementation is limited.

There _is no_ `smb.conf` file for the macOS implementation of Samba. Apple's SMB implementation uses [nsmb.conf](https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man5/nsmb.conf.5.html) instead. Any example `smb.conf` file you encounter will _not_ apply to the stock version of `smbd` that ships on macOS. `smb.conf` only applies to the [open source versions of Samba](https://www.samba.org/).

It is probably **much easier to use the MacPorts formulas rather than manually compile Samba**. Though, if you would like to compile Samba from source on macOS it is certainly possible as I will explain here in this article.

# Compile and Install

You will need [Xcode](https://developer.apple.com/xcode/) in order to [install samba from source](https://wiki.samba.org/index.php/Build_Samba_from_Source).

Clone samba.

```
git clone https://git.samba.org/samba.git
```

Change into the `samba` directory.

```
cd samba
```

**Optionally**, you may checkout a specific branch or tag.

```
git checkout samba-4.7.1
```

Configure samba to be installed at `/opt/samba`.

```
./configure \
	--prefix=/opt/samba \
	--without-ad-dc \
	--without-acl-support
```

To fix a [bug with macOS support](https://bugzilla.samba.org/show_bug.cgi?id=11984), download [this tiny diff/patch file as `nss.diff`](/assets/compile-samba-macos/nss.diff) and apply it.

Run this from the root of the `samba` directory.

```
git apply ~/path/to/nss.diff
```

Make and install the app.

```
make && sudo make install
```

# Config

I created directories for sharing at `/srv/smb/protected` and `/srv/smb/public`.

I found that I had to add a host entry for my machine's FQDN to `/etc/hosts` or else I received some `getaddrinfo` and `NT_STATUS_INVALID_PARAMETER` errors in the samba logs.

```
# /etc/hosts

...
127.0.0.1    wills-iMac.local
```

There are more than enough resources on samba config files out in the wild so you can Google as needed to update this config for your needs. I created my samba config at `/etc/smb.conf`.

```
# /etc/smb.conf

[global]
passdb backend = tdbsam://etc/passdb.tdb
map to guest = Bad user

# This is a read/write share.
# This share requires auth.
[share1]
path = /srv/smb/protected
guest ok = no
read only = no

# This is a read only share.
# This share requires no auth.
[share2]
path = /srv/smb/public
guest ok = yes
read only = yes
```

Create a user in `System Preferences` -> `Users & Groups` named `sambaUser`. It can be a `Sharing Only` user rather than Standard or Administrator.

Make sure that the `sambaUser` user owns the `protected` directory.

```
sudo chown -R sambaUser /srv/smb/protected
```

In our `smb.conf` we specified that we will use a Samba trivial [password database](https://www.samba.org/samba/docs/man/Samba-HOWTO-Collection/passdb.html#id2592649) for authentication and that it will be stored at `/etc/passdb.tdb`. We will now add an entry to that database for `sambaUser`.

Samba users **must be real users on your system**. You _cannot_ make up fake users. They [must](https://serverfault.com/questions/541409/can-i-add-samba-users-without-having-to-add-unix-ones) [correspond to users](https://arstechnica.com/civis/viewtopic.php?t=286765) [that](https://lists.samba.org/archive/samba/2004-March/083058.html) [exist on your OS](https://ubuntuforums.org/showthread.php?t=825686). That is why we created the `sambaUser`. `sambaUser` is explicitly for authenticating against our system over Samba.

You can set a Samba password for the `sambaUser like so.

```
/opt/samba/bin/smbpasswd \
	-c /etc/smb.conf \
	-L \
	-a \
	-U \
	sambaUser
```

# Run

It is possible to run this as a daemon (default), but this command runs in the foreground to help see the logs and diagnose issues.

```
sudo /opt/samba/sbin/smbd \
	--log-stdout \
	--debuglevel=10 \
	--foreground \
	--configfile=/etc/smb.conf
```

# Connect

You should be able to connect to your **Samba macOS server** from either a **Linux Client** or a **Mac Client**.

## macOS Client (with authentication)

```
sudo mount \
	-t smbfs \
	//sambaUser@the.samba.server.ip/share1 /mnt/smb
```

## macOS Client (as guest)

```
sudo mount \
	-t smbfs \
	//guest@the.samba.server.ip/share2 /mnt/smb
```

## Linux Client (with authentication)

```
sudo mount \
	-t cifs \
	-o user=sambaUser \
	//the.samba.server.ip/share1 /mnt/smb
```

## Linux Client (as guest)

```
sudo mount \
	-t cifs \
	-o user=guest,pass= \
	//the.samba.server.ip/share2 /mnt/smb
```

# Citations

* https://wiki.samba.org/index.php/Samba4/OSX#Compiling.2C_Installing_and_Provisioning
* https://bugzilla.samba.org/show_bug.cgi?id=11811
* https://bugzilla.samba.org/show_bug.cgi?id=11984
* https://bugzilla.samba.org/show_bug.cgi?id=9659
* https://wiki.samba.org/index.php/Samba4/OSX
* https://wiki.samba.org/index.php/Build_Samba_from_Source
* https://wiki.samba.org/index.php/Using_Git_for_Samba_Development#Git_Installation
* https://www.samba.org/samba/docs/man/manpages-3/smb.conf.5.html
* https://www.samba.org/samba/docs/using_samba/appe.html
* https://stackoverflow.com/questions/12619600/libiconv-and-macos
