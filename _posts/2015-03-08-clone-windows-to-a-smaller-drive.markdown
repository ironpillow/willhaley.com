---
layout: post
title: "Clone Windows To a Smaller Drive"
date: 2015-03-08 22:41:38 -0500
comments: true
categories: 
---

In the past I have used the built-in Windows Disk Management snap-in to shrink volumes and clone them to smaller disks, but I [recently](https://social.technet.microsoft.com/Forums/windowsserver/en-US/aef091ac-7b33-4b43-9c37-5b25a6ebc219/cant-shrink-volume-even-with-160gb-free) [discovered](http://superuser.com/questions/781985/cant-shrink-to-available-partition-volume-in-windows) that in some cases, Windows will only let you shrink a volume so far.

If a volume cannot be shrunk down enough, then it will be impossible to clone it to a smaller drive.  This may happen if you want to replace a 1TB 5400 RPM drive with something like a 512GB SSD.

<!-- more -->

The reason it may be impossible to shrink a volume beyond a certain point in Windows, even after a defrag, is that some system files cannot be moved.  The paging file seems to be the common culprit here.  So if that paging file lives somewhere around the 700GB mark on a 1TB drive, then you will never be able to shrink the volume lower than 700GB.

GParted could potentially be used to shrink the NTFS volume, but part of me is nervous about using a non-Windows program to shrink a stock Windows NTFS partition where a particular system file is in a very particular location.

More so, this is a lot of work just to migrate to an SSD.

I am not normally the type to use relatively unknown closed-source software on a whim, but I gave [EaseUs Todo Backup](http://www.easeus.com/backup-software/) a spin [thanks to a lifehacker article](http://lifehacker.com/5837543/how-to-migrate-to-a-solid-state-drive-without-reinstalling-windows) and I was very pleasantly surprised at how well it worked.

The software was able to migrate all the OEM partitions on a stock Dell laptop to a smaller SSD *while booted into Windows* and without any issues whatsoever.  All I had to do was plug the SSD into the source machine and run the software.

It was a dream and I highly reccomend [checking out the free version](http://www.easeus.com/backup-software/).
