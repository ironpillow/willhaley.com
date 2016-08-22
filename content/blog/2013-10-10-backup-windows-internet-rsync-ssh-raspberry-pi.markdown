---
title: "Backup Windows over the Internet with rsync, SSH, and Raspberry Pi"
slug: backup-windows-internet-rsync-ssh-raspberry-pi
date: 2013-10-10 20:22:00
disqus: true
---

You will need the following:

1. A Pi with Raspbian installed and the SSH daemon (sshd) enabled
1. Enough free space on your Pi to backup whatever it is you want to backup (you could always connect an external drive and mount that on your Pi)
1. Update your router so that external requests to port 22 (SSH) are forwarded to your Pi
1. Read and understand the risks involved with exposing port 22 (SSH) to the Internet

<!-- more -->

These instructions assume you are using the default pi account on the Pi device.

First, create an account with [no-ip](http://www.noip.com/).  This will allow you to create a free dynamic domain name.  This is important because when you backup the Windows machine to your Pi, you probably don't want to use an IP address for the destination.  The reason being that most ISPs provide a dynamic IP for you, and this can change.  Follow these [instructions](http://www.noip.com/support/knowledgebase/installing-the-linux-dynamic-update-client/) to get the no-ip client working on your Pi.

Once done, on your Raspbian box:

```
apt-get install rsync
mkdir ~/.ssh
sudo mkdir /backup && chown pi /backup
```

Use the passwd command to update your pi password. Make it something complex. We're going to expose your Pi to the Internet so there is a risk someone could compromise your Pi over SSH or another attack vector. Let's at least change the password from the default.

On Windows:

Install [cwrsync](http://www.rsync.net/resources/binaries/cwRsync_3.1.0_Installer.zip)

Generate a public SSH key. Note, those are two apostrophes (single quotes) at the end of the second line.

```
cd "c:\program files\cwrsync\bin"
ssh-keygen -t rsa -N ''
```

Use the following command to copy the public key you just generated to your raspberry pi. Replace USERNAME with the user name on your Windows box.  This will overwrite the authorized_keys file on your pi. If you don't want to clobber that file, then make sure you append to it and/or back it up before you run this command.

```
rsync -av -e "ssh" "/cygdrive/c/documents and settings/USERNAME/.ssh/id_rsa.pub" pi@yourdomain.no-ip.org:.ssh/authorized_keys
```

You should be prompted for your password on the Pi. If all went well, you just copied your public SSH key on the Windows box to the Pi. You should now be able to simply ssh to your Pi and you should not be prompted for a password.

```
ssh pi@yourdomain.no-ip.org
```

This is important so that your backups can run without needing someone to enter a password every time.

Make a bat file on the windows box.  Save it in C:\ and call it backup.bat

```
timeout /t 60
cd "c:\program files\cwrsync\bin"
rsync --delete --exclude="AppData/Local/Application Data" --exclude="AppData/Local/Microsoft/Windows/Temporary Internet Files" --bwlimit=5000 --progress -av -e "ssh -i C:\docume~1\USERNAME\.ssh\id_rsa" "/cygdrive/c/documents and settings/USERNAME" pi@yourdomain.no-ip.org:/backup > C:\backup.log 2>&1
```

What does backup.bat do?

1. Sync the entire profile for USERNAME to the /backup folder on the Pi.  You can modify that source path to just about anything.
1. The --bwlimit flag is limiting the bandwidth used by rsync so you don't overwhelm your connection.
1. The exclusions on AppData are to prevent cyclical symlink transfers.
1. The timeout is specifying a delay in seconds before running the next command.

If that backup.bat file runs properly, then congratulations, you are now able to backup whatever directory you specified on your Windows box to your Raspberry Pi.  You could potentially run this backup.bat file whenever you choose by manually launching the script, or, to have this backup run automatically you can do several different things.  You may want to look into Task Scheduler on Windows, but I prefer something a little more basic.

Create a file in C:\ called invisible.vbs with these contents

```
CreateObject("Wscript.Shell").Run """" & WScript.Arguments(0) & """", 0, False
```

Create a shortcut in your "Startup" folder.  To open your Startup folder, click the Start button, then All Programs, then right click on Startup and click Open.  Everything in this folder will run when you login.  Right click in this folder and Create Shortcut with this command.

```
wscript.exe C:\invisible.vbs C:\backup.bat
```

That should be it. Next time, and every time, you login your computer should, invisibly, run backup.bat. backup.bat will wait for the number of seconds specified in the timeout command, then it will run a throttled backup over the Internet to your Raspberry Pi.

Much of the rsync instructions are thanks to [rsync.net](http://www.rsync.net/resources/howto/windows_rsync.html)
