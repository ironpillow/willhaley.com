---
title: "Booting macOS From An External USB 3.0 Drive"
slug: boot-mac-usb-3-external
date: 2017-11-06 00:00:00
---

I have a [Late 2012 21.5" iMac](https://support.apple.com/kb/sp665?locale=en_US) with a dying 5400 RPM Drive.

Backups are failing for reasons that are very ambiguous. All I know is that the machine keeps complaining that `Time Machine couldn't back up`, that the Time Machine drive constantly needed first aid, and then first aid would consistently fail with exit code `8`.

![time-machine.png](/assets/boot-mac-usb-3-external/time-machine.png)

I realize that sounds much more like the Time Machine drive is at fault, and not the internal drive.

However, I replaced the Time Machine drive and enclosure with an SSD, and the issue persisted.

At this point, I decided that the underlying issue was that the internal fusion drive was failing.

I was seeing very slow performance and system hangs that required a hard shutdown, and took that as a hint that the drive was dying and causing this corruption I was seeing with Time Machine.

# Replacing The Boot Drive On An iMac...Or Not

I was originally planning to [replace the internal drive](https://www.youtube.com/watch?v=AHVOCoi6Q6E) in my iMac with an SSD. The process is certainly doable, but I hate the idea of cracking open the iMac, taking apart components, and re-applying glue. It seems like so much can go wrong.

Eventually, it hit me, modern Macs have the built-in ability to boot from an external drive. Why not boot from that rather than try to replace the internal drive?

I read that others had [great success](https://www.macworld.com/article/2907125/use-an-external-ssd-to-make-an-old-mac-feel-new-without-cracking-it-open.html) booting externally like this, and it [seems](http://osxdaily.com/2013/06/22/boot-mac-external-drive/) [like](https://apple.stackexchange.com/questions/112351/can-i-boot-mac-from-an-external-hard-drive-internal-hard-drivehard-drive-closu) something that is very commonly done with Macs.

At this point I decided I would be booting externally, and forgo the internal hard drive upgrade.

# USB 3.0 or Thunderbolt 1?

My iMac has both USB 3.0 and [Thunderbolt 1 ports](https://support.apple.com/en-us/HT204154) and did a lot of research to try and determine which connection was ideal for booting an external drive.

[Some posts](https://forums.macrumors.com/threads/external-ssd-as-boot-drive-usb-3-vs-thunderbolt.1709803/) warned that USB 3.0 does not support TRIM, but that the performance is essentially the same.

I [also](https://forums.macrumors.com/threads/thunderbolt-ssd-enclosure.1708619/#post-18803508) [noticed](https://forums.macrumors.com/threads/imac-bto-which-is-which.1708796/#post-18803060) that [UASP](https://en.wikipedia.org/wiki/USB_Attached_SCSI) support in the USB 3.0 enclosure would reportedly [make a great difference](https://blog.startech.com/post/all-you-need-to-know-about-uasp/).

I compared both my [Thunderbolt enclosure]({{<relref "2017-10-01-thunderbolt-enclosure.markdown" >}}) and [USB 3.0 with UASP enclosure]({{<relref "2017-09-28-usb-3-uasp.markdown" >}}) for booting my Mac, and found that booting macOS from **USB 3.0 performed better than Thunderbolt**, and was far cheaper.

Based on my tests, I think USB 3.0 is the best way to go, and that is what I ended up using. Though, Thunderbolt is nearly as fast and seems like a perfectly viable option too.

# Installing macOS

I rebooted my iMac to the recovery partition and installed macOS to my external drive.

The install seemed much slower than I would have hoped. The "8 minutes remaining" turned into 20 minutes. This was disheartening. I was convinced there was no way this would work.

Thankfully, I did not prematurely stop the installation. I let it finish, the machine rebooted to the external drive, and it ran wonderfully!

My Mac automatically defaulted to booting to the external drive, and everything was very snappy and worked great. Yay!

Write performance went from ~82.3 MiB/s to ~339 MiB/s

```
# Before
cat /dev/zero | pv -t -a > /tmp/garbage.file
19:42 [82.3MiB/s]
```

```
# After
cat /dev/zero | pv -t -a > /tmp/garbage.file
0:02:14 [ 339MiB/s]
```

I used the migration assistant to transfer data and everything worked perfectly. Time Machine backups are now working without issue.

The only remaining task for me is to wipe the internal drive to prevent accidentally booting to it in the future.

<!--
TODO WFH Using external SSD for default booting
https://discussions.apple.com/thread/7450878?start=0&tstart=0

TODO WFH How to set up and use an external Mac startup disk
https://support.apple.com/en-us/HT202796 -->
