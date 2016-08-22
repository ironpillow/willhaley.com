---
title: "Thunderbolt 1 Enclosure"
slug: thunderbolt-enclosure
date: 2017-10-01 00:00:00
---

My research has led me to believe that there are no single-bay 2.5" diskless Thunderbolt 1 enclosures.

The enclosures I have found all include at least one drive, and many of them are built using sleek unibody designs that do not seem conducive to replacing the hard drive.

I have decided that the only way to get an "empty" Thunderbolt 1 enclosure is to find an external Thunderbolt 1 device that already has a drive in it, and to then open it up and replace the hard drive within as needed.

Although I imagine that many Thunderbolt 1 drives could potentially be opened and have their drives upgraded, I ended up choosing the [LaCie Rugged Thunderbolt and USB 3.0 1TB Portable Hard Drive STEV1000400](https://www.amazon.com/gp/product/B01GHCUAKO/ref=oh_aui_detailpage_o01_s00?ie=UTF8&psc=1).

It was affordable compared to many other Thunderbolt 1 drives, and it was the only device for which I could find any evidence that someone successfully opened it and upgraded the drive.

[LACIE 2TB USB 3.0 Thunderbolt Drive DISASSEMBLE / SSD SWAP](https://www.youtube.com/watch?v=D9mglHTQWW0).

My model Lacie is not the same one as in that video, but thankfully the drives are so similar that the video applied to my drive as well, and was a huge help.

# Performance

I ran a performance test on my Lacie with the original hard drive. In my case, a 7200 RPM 1TB Seagate drive.

I connected it to my MacBook as an external drive and I wrote data to the disk for 15 minutes.

```
cat /dev/zero | pv -a -t /dev/rdisk2
0:15:00 [ 130MiB/s]
```

The average speed was 130 MiB/s (1.090 Gbps).

After I upgraded the drive to a [Samsung 850 EVO 500GB 2.5-Inch SATA III Internal SSD (MZ-75E500B/AM)](https://www.amazon.com/gp/product/B00OBRE5UE/ref=oh_aui_detailpage_o06_s00?ie=UTF8&psc=1), I installed macOS to the drive and booted to it to do some other performance tests.

First, I booted to the drive using the Thunderbolt 1 interface, and wrote data to a garbage file on disk.

```
cat /dev/zero | pv -a -t /tmp/garbage.file
0:02:00 [ 358MiB/s]
```

The average speed was 358 MiB/s (3.003 Gbps).

Finally, I booted to the drive using the UBS 3.0 interface, and wrote data to a garbage file on disk.

```
cat /dev/zero | pv -a -t /tmp/garbage.file
0:03:00 [ 383MiB/s]
```

The average speed was 383 MiB/s (3.212 Gbps).

I was expecting Thunderbolt 1 to be faster than USB 3.0 since it has a theoretical max speed of 10 Gbps, but USB 3.0 was faster by a small margin.

If your goal is performance, and your options are USB 3.0 or Thunderbolt 1, these results would make me say it is worthwhile to save money and buy a USB 3.0 enclosure rather than attempting to do what I did here.

**It does not seem that Thunderbolt 1 provides any meaningful advantage over USB 3.0 in my simple tests.**

# Dissasembly And Upgrading To An SSD

**Warning: This WILL void your warranty**

The drive offers both USB 3.0 and Thunderbolt 1 connectivity.

![1.jpg](/images/thunderbolt-enclosure/1.jpg)

The Thunderbolt 1 cable is hard-wired.

![2.jpg](/images/thunderbolt-enclosure/2.jpg)

The USB 3.0 cable is detachable.

![3.jpg](/images/thunderbolt-enclosure/3.jpg)

![6.jpg](/images/thunderbolt-enclosure/6.jpg)

The drive is a breeze to disassemble.

The rubber casing can be removed simply by stretching it off.

![4.jpg](/images/thunderbolt-enclosure/4.jpg)

Underneath are four screws. These are the only screws that need to be removed.

![5.jpg](/images/thunderbolt-enclosure/5.jpg)

You can then slide the drive assembly out.

![7.jpg](/images/thunderbolt-enclosure/7.jpg)

You will have to peel off the magnetic tape. Unfortunately, you will probably end up breaking the tape, but I do not _think_ that it serves a significant purpose, so I would not worry too much.

![8.jpg](/images/thunderbolt-enclosure/8.jpg)

The drive inside is a standard SATA drive. In my case, it is a 7200 RPM 1 TB drive.

At this point, you can simply slide the drive out of the SATA connector, install your new drive, and reverse these steps.

![9.jpg](/images/thunderbolt-enclosure/9.jpg)

Thankfully, it is all very straightforward.
