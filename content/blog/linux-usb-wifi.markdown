---
title: "Ubuntu Linux Compatible WiFi USB Adapters"
date: 2017-02-05 13:03:00
lastmod: 2018-04-14 19:09:00
aliases: [
    /blog/linux-16-04-1-usb-wifi-adapters/
]
disqus: true
---

# First, Consider Tethering

As pointed out by [@roland in the comments](https://willhaley.com/blog/linux-usb-wifi/#comment-3695819134) you may find that the easiest, cheapest, fastest, and most reliable way to get a USB WiFi connection on your Linux box is by using USB tethering with your smartphone.

This is possible natively in [Android](https://android.stackexchange.com/questions/3134/can-i-use-my-android-device-as-wi-fi-adapter-for-my-pc-i-e-tethering-to-pc-thr). It is not possible with [iOS](https://apple.stackexchange.com/questions/31182/share-iphone-wifi-with-computer-over-usb) unless iOS is jailbroken. iOS can share its _cellular_ connection over USB natively, but not its _WiFi_ connection unless it is jailbroken.

A Raspberry Pi 3 B+ (which [supports 802.11ac 5Ghz](https://www.raspberrypi.org/blog/raspberry-pi-3-model-bplus-sale-now-35/)) can [also be used to accomplish a similar result]({{< relref "raspberry-pi-wifi-ethernet-bridge.markdown" >}}), but using ethernet rather than USB.

I recommend considering some form of tethering before buying a USB WiFi device for the reasons explained below. Generally speaking, USB WiFi in Linux is a tricky thing to get right.

# Linux WiFi Warnings

Read [the Introduction in the Debian WiFi article](https://wiki.debian.org/WiFi) before diving into Linux and USB WiFi devices. Also, feel free to read about [my own experiences on this topic]({{< relref "finding-linux-wifi-usb.markdown" >}}). I rewrote this article after a [helpful commenter]({{< relref "#comment-3480480313" >}}) pointed out [how problematic it is]({{< relref "finding-linux-wifi-usb.markdown" >}}) to recommend USB WiFi devices for Linux. _Most_ manufacterers do not play well with Linux, with some [notable exceptions]({{< relref "#tpe-n150usb-great-for-linux" >}}).

Ever wonder some [Amazon reviews have conflicting reports]({{< relref "finding-linux-wifi-usb.markdown#marketing-and-sales-confusion" >}}) about Linux support? Read those articles I just listed! It is [almost impossible to know which chipset one will receive when buying most USB WiFi devices]({{< relref "finding-linux-wifi-usb.markdown#chipset-inconsistency" >}}) except when buying [🐧 ThinkPenguin device](https://www.thinkpenguin.com/catalog/wireless-networking-gnulinux).

I understand that ThinkPenguin devices may not be ideal for everyone. I am listing other, _non-ThinkPenguin devices_, that I have tested. However, for the reasons I stated above, it is a gamble whether or not they will work for everyone. ThinkPenguin devices are a much simpler option for Linux. Unfortunately, ThinkPenguin devices lack 802.11ac support and are a bit more expensive.

**You are responsible for your own purchasing decisions and I make no guarantees!**

# Devices Tested

* [TPE-N150USB - Great for Linux 🐧]({{< relref "#tpe-n150usb-great-for-linux" >}})
* [TPE-N150USBL - Great for Linux 🐧]({{< relref "#tpe-n150usbl-great-for-linux" >}})
* [EW-7811UTC - Works with 802.11ac]({{< relref "#ew-7811utc-works-with-802-11ac" >}})
* [PAU06 - Cheap, but less reliable]({{< relref "#pau06-cheap-but-less-reliable" >}})
* [PAU05 - Cheap, but less reliable]({{< relref "#pau05-cheap-but-less-reliable" >}})

This is _not_ an exhaustive list. I have _not_ purchased hundreds of cards. I have purchased several cards, and am ranking only the cards _I own_. As an average Linux user, I will do the best I can to relate what I found so that it may help others.

_All cards were tested using Ubuntu 16.04.3 LTS Xenial Xerus `4.10.0-37-generic #41~16.04.1-Ubuntu SMP Fri Oct 6 22:42:59 UTC 2017` against a server running iperf 3.0.11. Each test was performed over a period of 4 hours. See [my wifi-testing repo](https://github.com/williamhaley/wifi-testing) if you are interested._

# TPE-N150USB - Great for Linux

[Penguin Wireless N USB Adapter for GNU / Linux (TPE-N150USB)](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-gnu-linux-tpe-n150usb)

![/images/linux-usb-wifi/tpe-n150usb.jpg](/images/linux-usb-wifi/tpe-n150usb.jpg)

**Chipset**: [AR9271](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-gnu-linux-tpe-n150usb)

**Driver**: [ath9k_htc](https://wiki.debian.org/ath9k_htc)

```
0cf3:9271 Qualcomm Atheros Communications AR9271 802.11n
```

The TPE-N150USB performed very reliably in my tests. Download speeds averaged `31.16 Mbps` and upload speeds averaged `11.58 Mbps`. The `max` speeds never topped `40.0 Mbps`, but I found that the overall consistency in performance was stellar.

From the research I have done, I would say this is going to be the most reliable Linux supported mini USB WiFi networking interface a consumer can except to find.

This card is [supported by the Linux Kernel](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-gnu-linux-tpe-n150usb), which means that no special intervention is required to get this NIC to work. Just plug it in. It also [supports Monitor mode](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-gnu-linux-tpe-n150usb), which is great for security analysis. Since ThinkPenguin uses reliable chipsets we can have confidence that we will receive the chipset that was advertised.

This card is my favorite considering the size, performance consistency, and Linux support.

**Download Tests**

```
 0.0 -  3.3 Mbps |   0
 3.3 -  6.7 Mbps |   4
 6.7 - 10.0 Mbps |   8
10.0 - 13.3 Mbps |   6
13.3 - 16.7 Mbps |  10
16.7 - 20.0 Mbps |   2
20.0 - 23.3 Mbps |   0
23.3 - 26.7 Mbps |   2
26.7 - 30.0 Mbps |  58 +++++
30.0 - 33.3 Mbps | 325 ++++++++++++++++++++++++++++++
33.3 - 36.7 Mbps | 152 ++++++++++++++
36.7 - 40.0 Mbps |   3
40.0 - 43.3 Mbps |   0
43.3 - 46.7 Mbps |   0
46.7 - 50.0 Mbps |   0
total: 570
max: 37.0923 Mbps
min: 5.70558 Mbps
average: 31.16 Mbps
```

**Upload Tests**

```
 0.0 -  3.3 Mbps |   5
 3.3 -  6.7 Mbps |  28 ++
 6.7 - 10.0 Mbps |  53 ++++
10.0 - 13.3 Mbps | 362 ++++++++++++++++++++++++++++++
13.3 - 16.7 Mbps | 122 ++++++++++
16.7 - 20.0 Mbps |   1
20.0 - 23.3 Mbps |   0
23.3 - 26.7 Mbps |   0
26.7 - 30.0 Mbps |   0
30.0 - 33.3 Mbps |   0
33.3 - 36.7 Mbps |   0
36.7 - 40.0 Mbps |   0
40.0 - 43.3 Mbps |   0
43.3 - 46.7 Mbps |   0
46.7 - 50.0 Mbps |   0
total: 571
max: 17.9236 Mbps
min: 2.44766 Mbps
average: 11.58 Mbps
```

# TPE-N150USBL - Great for Linux

[Penguin Wireless N USB Adapter /w External Antenna for GNU / Linux (TPE-N150USBL)](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-w-external-antenna-gnu-linux-tpe-n150usbl)

![/images/linux-usb-wifi/tpe-n150usbl.jpg](/images/linux-usb-wifi/tpe-n150usbl.jpg)

**Chipset**: [AR9271](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-w-external-antenna-gnu-linux-tpe-n150usbl)

**Driver**: [ath9k_htc](https://wiki.debian.org/ath9k_htc)

```
0cf3:9271 Qualcomm Atheros Communications AR9271 802.11n
```

The TPE-N150USBL performed very reliably in my tests. Download speeds averaged `32.25 Mbps` and upload speeds averaged `17.35 Mbps`. The `max` speeds never topped `40.0 Mbps`, but I found that the overall consistency in performance was stellar.

This card seems to be almost identical to the TPE-N150USB. Both cards use the same chipset, same vendor ids, same product ids, and had almost identical performance statistics. This card was a tad faster, but it seems the difference in speeds is very slight. The external antenna on the TPE-N150USBL did not make much difference in testing. In my opinion, this card is not worth the additional cost compared to the TPE-N150USB.

This card is [supported by the Linux Kernel](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-w-external-antenna-gnu-linux-tpe-n150usbl), which means that no special intervention is required to get this NIC to work. Just plug it in. It also [supports Monitor mode](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-w-external-antenna-gnu-linux-tpe-n150usbl), which is great for security analysis. Since ThinkPenguin uses reliable chipsets we can have confidence that we will receive the chipset that was advertised.

**Download Tests**

```
 0.0 -  3.3 Mbps |   0
 3.3 -  6.7 Mbps |   3
 6.7 - 10.0 Mbps |   8
10.0 - 13.3 Mbps |   7
13.3 - 16.7 Mbps |   7
16.7 - 20.0 Mbps |   7
20.0 - 23.3 Mbps |   3
23.3 - 26.7 Mbps |   4
26.7 - 30.0 Mbps |  16
30.0 - 33.3 Mbps | 176 +++++
33.3 - 36.7 Mbps | 305 ++++++++++
36.7 - 40.0 Mbps |  31 +
40.0 - 43.3 Mbps |   0
43.3 - 46.7 Mbps |   0
46.7 - 50.0 Mbps |   0
total: 567
max: 38.28 Mbps
min: 5.35 Mbps
average: 32.52 Mbps
sucess: 567
errors: 0
```

**Upload Tests**

```
 0.0 -  3.3 Mbps |   0
 3.3 -  6.7 Mbps |  16
 6.7 - 10.0 Mbps |  11
10.0 - 13.3 Mbps |   4
13.3 - 16.7 Mbps |  55 +
16.7 - 20.0 Mbps | 459 ++++++++++
20.0 - 23.3 Mbps |  22
23.3 - 26.7 Mbps |   0
26.7 - 30.0 Mbps |   0
30.0 - 33.3 Mbps |   0
33.3 - 36.7 Mbps |   0
36.7 - 40.0 Mbps |   0
40.0 - 43.3 Mbps |   0
43.3 - 46.7 Mbps |   0
46.7 - 50.0 Mbps |   0
total: 567
max: 21.39 Mbps
min: 4.25 Mbps
average: 17.35 Mbps
sucess: 567
errors: 0
```

# EW-7811UTC - Works with 802.11ac

[Edimax EW-7811UTC AC600 Dual-Band](https://www.amazon.com/gp/product/B00FW6T36Y/ref=oh_aui_search_detailpage?ie=UTF8&psc=1)

![/images/linux-usb-wifi/ew-7811utc.jpg](/images/linux-usb-wifi/ew-7811utc.jpg)

**Potential Chipsets**: [RTL8811AU](https://wikidevi.com/wiki/Edimax_EW-7811UTC_7392_A812)

**Potential Drivers**: [scrivy/rtl8812au](https://github.com/scrivy/rtl8812AU_8821AU_linux), [diederikdehaas/rtl8812AU](https://github.com/diederikdehaas/rtl8812AU), [gordboy/rtl8812au](https://github.com/gordboy/rtl8812au), [abperiasamy/rtl8812AU_8821AU_linux](https://github.com/abperiasamy/rtl8812AU_8821AU_linux), [gnab/rtl8812au](https://github.com/gnab/rtl8812au), [sloretz/rtl8811au](https://github.com/sloretz/rtl8811au), [Edimax](http://www.edimax.com/edimax/download/download/data/edimax/au/download/for_home/wireless_adapters/wireless_adapters_ac600_dual-band/ew-7811utc), [rtl8812au-dkms](https://packages.ubuntu.com/xenial/kernel/rtl8812au-dkms)

```
7392:a812 Edimax Technology Co., Ltd
```

<span class="warning">Purchasing this card means there is [no guarantee that anyone will receive the same chipset I received]({{< relref "finding-linux-wifi-usb.markdown" >}}), as I state in the warnings above. Performance and support for this card **will** vary based on which chipset it ships with.</span>

Getting this device to work on Linux was complicated. There [are](https://github.com/diederikdehaas/rtl8812AU) [multiple](https://github.com/gordboy/rtl8812au) [drivers](https://github.com/abperiasamy/rtl8812AU_8821AU_linux) by [multiple](https://github.com/gnab/rtl8812au) [authors](https://github.com/sloretz/rtl8811au) for this chipset. None of these linked drivers worked for me.

I tried multiple variations of the [official Edimax driver code](http://www.edimax.com/edimax/download/download/data/edimax/au/download/for_home/wireless_adapters/wireless_adapters_ac600_dual-band/ew-7811utc), but none of the Edimax drivers built successfully for me, and I did not want to spend time debugging their build scripts.

I found that the [Ubuntu package for this driver](https://packages.ubuntu.com/xenial/kernel/rtl8812au-dkms) would not build on my (vanilla) Ubuntu install either.

[This article](https://blog.danielscrivano.com/installing-rtl8812au-on-linux-for-wireless-dual-band-usb-adapters/) finally helped me find a working driver. For me, the working driver was the [rtl8812AU_8821AU_linux driver by scrivy](https://github.com/scrivy/rtl8812AU_8821AU_linux).

Once working, this card seemed **blazing fast** (relative to other Linux WiFi adapters that I tested) for me on Ubuntu 16.04.3. The performance boost came from 802.11ac. With 802.11ac I saw download speeds average `64.16 Mbps` and upload speeds average `59.42 Mbps`.

Overall, the performance of this card seemed very reliable for me.

**Please note** this is clearly not a well supported device on Linux, there are risks in downloading software from random repos, there are **[multiple versions](https://wikidevi.com/wiki/Edimax_EW-7811UTC_7392_A812)** of this device sold by Edimax, I only tested on Ubuntu, others may well [receive a different chipset that I did]({{< relref "finding-linux-wifi-usb.markdown" >}}), and there is no guarantee this card will work for everyone.

_This is the only 802.11ac card I tested. Speeds are all for my 802.11ac network._

**Download Tests**

```
 0.0 -  6.0 Mbps |   0
 6.0 - 12.0 Mbps |   0
12.0 - 18.0 Mbps |   1
18.0 - 24.0 Mbps |   0
24.0 - 30.0 Mbps |   0
30.0 - 36.0 Mbps |   0
36.0 - 42.0 Mbps |   0
42.0 - 48.0 Mbps |   0
48.0 - 54.0 Mbps |   2
54.0 - 60.0 Mbps | 125 +++++++++++++++++++
60.0 - 66.0 Mbps | 190 ++++++++++++++++++++++++++++++
66.0 - 72.0 Mbps | 171 +++++++++++++++++++++++++++
72.0 - 78.0 Mbps |  35 +++++
78.0 - 84.0 Mbps |   0
84.0 - 90.0 Mbps |   0
total: 524
max: 75.8806 Mbps
min: 15.0154 Mbps
average: 64.16 Mbps
```

**Upload Tests**

```
 0.0 -  6.0 Mbps |   0
 6.0 - 12.0 Mbps |   0
12.0 - 18.0 Mbps |   0
18.0 - 24.0 Mbps |   0
24.0 - 30.0 Mbps |   0
30.0 - 36.0 Mbps |   0
36.0 - 42.0 Mbps |   0
42.0 - 48.0 Mbps |   0
48.0 - 54.0 Mbps |   4
54.0 - 60.0 Mbps | 259 +++++++++++++++++++++++++++++
60.0 - 66.0 Mbps | 261 ++++++++++++++++++++++++++++++
66.0 - 72.0 Mbps |   0
72.0 - 78.0 Mbps |   0
78.0 - 84.0 Mbps |   0
84.0 - 90.0 Mbps |   0
total: 524
max: 63.3158 Mbps
min: 50.9182 Mbps
average: 59.42 Mbps
```

# PAU06 Cheap, But Less Reliable

[Panda Wireless PAU06 300Mbps N](https://www.amazon.com/Panda-Wireless-PAU06-300Mbps-Adapter/dp/B00JDVRCI0)

![/images/linux-usb-wifi/pau06.jpg](/images/linux-usb-wifi/pau06.jpg)

**Potential Chipsets**: [RT5372](https://wikidevi.com/wiki/Panda_PAUO6)

**Potential Drivers**: [rt2800usb](https://wiki.debian.org/rt2800usb)

```
148f:5372 Ralink Technology, Corp. RT5372 Wireless Adapter
```

<span class="warning">Purchasing this card means there is [no guarantee that anyone will receive the same chipset I received]({{< relref "finding-linux-wifi-usb.markdown" >}}), as I state in the warnings above. Performance and support for this card **will** vary based on which chipset it ships with.</span>

This card (at least, the one that I received) uses a reasonably common chipset, and so a reasonably well supported Linux driver out of the box on Ubuntu 16.04.3.

It is relatively cheap, worked out of the box, and connected to my AP without issue. The chipset I received supports monitor mode, but [it is very likely others who buy this card may not have a chipset that supports monitor mode]({{< relref "finding-linux-wifi-usb.markdown" >}}). Compared to the other cards here, **I would say the performance is very unreliable**.

Just look at the wide range of download and upload speeds below. I re-ran these tests multiple times at different times of day (and overnight) and the speeds are very inconsistent in all test cases.

I have only seen one reported chipset for this device in my research, but as I warn multiple times, that is [no guarantee that the card others receive will have the same chipset as mine]({{< relref "finding-linux-wifi-usb.markdown" >}}).

**Download Tests**

```
 0.0 -  3.3 Mbps | 38 +++++++++++
 3.3 -  6.7 Mbps | 56 +++++++++++++++++
 6.7 - 10.0 Mbps | 63 +++++++++++++++++++
10.0 - 13.3 Mbps | 92 ++++++++++++++++++++++++++++
13.3 - 16.7 Mbps | 90 ++++++++++++++++++++++++++++
16.7 - 20.0 Mbps | 96 ++++++++++++++++++++++++++++++
20.0 - 23.3 Mbps | 62 +++++++++++++++++++
23.3 - 26.7 Mbps | 33 ++++++++++
26.7 - 30.0 Mbps | 18 +++++
30.0 - 33.3 Mbps |  6 +
33.3 - 36.7 Mbps |  2
36.7 - 40.0 Mbps |  0
40.0 - 43.3 Mbps |  0
43.3 - 46.7 Mbps |  0
46.7 - 50.0 Mbps |  0
total: 556
max: 35.8563 Mbps
min: 1.14618 Mbps
average: 14.36 Mbps
```

**Upload Tests**

```
 0.0 -  3.3 Mbps |   6
 3.3 -  6.7 Mbps | 104 +++++++++
 6.7 - 10.0 Mbps | 332 ++++++++++++++++++++++++++++++
10.0 - 13.3 Mbps | 111 ++++++++++
13.3 - 16.7 Mbps |   2
16.7 - 20.0 Mbps |   0
20.0 - 23.3 Mbps |   0
23.3 - 26.7 Mbps |   0
26.7 - 30.0 Mbps |   1
30.0 - 33.3 Mbps |   0
33.3 - 36.7 Mbps |   0
36.7 - 40.0 Mbps |   0
40.0 - 43.3 Mbps |   0
43.3 - 46.7 Mbps |   0
46.7 - 50.0 Mbps |   0
total: 556
max: 28.5147 Mbps
min: 2.09204 Mbps
average: 8.33 Mbps
```

# PAU05 Cheap, But Less Reliable

[Panda 300Mbps PAU05 Wireless N USB Adapter](https://www.amazon.com/Panda-300Mbps-Wireless-USB-Adapter/dp/B00EQT0YK2)

![/images/linux-usb-wifi/pau05.jpg](/images/linux-usb-wifi/pau05.jpg)

**Potential Chipsets**: [RT3070](http://www.wirelesshack.org/kali-linux-nano-usb-adapters.html), [Atheros ?](https://www.amazon.com/gp/customer-reviews/R23NBB147NFJC0/ref=cm_cr_getr_d_rvw_ttl?ie=UTF8&ASIN=B00EQT0YK2), [RT2870](https://www.amazon.com/gp/customer-reviews/R9PNEUOR226MI/ref=cm_cr_getr_d_rvw_ttl?ie=UTF8&ASIN=B00EQT0YK2), [RT5732](https://www.amazon.com/gp/customer-reviews/RMT9IALY45B4T/ref=cm_cr_getr_d_rvw_ttl?ie=UTF8&ASIN=B00EQT0YK2)

**Potential Drivers**: [rt2800usb](https://wiki.debian.org/rt2800usb)

```
148f:5372 Ralink Technology, Corp. RT5372 Wireless Adapter
```

<span class="warning">Purchasing this card means there is [no guarantee that anyone will receive the same chipset I received]({{< relref "finding-linux-wifi-usb.markdown" >}}), as I state in the warnings above. Performance and support for this card **will** vary based on which chipset it ships with.</span>

This card (at least, the one that I received) uses a reasonably common chipset, and so a reasonably well supported Linux driver out of the box on Ubuntu 16.04.3.

It is relatively cheap, worked out of the box, and connected to my AP without issue. The chipset I received supports monitor mode, but [it is very likely others who buy this card may not have a chipset that supports monitor mode]({{< relref "finding-linux-wifi-usb.markdown" >}}). Compared to the other cards here, **I would say the performance is very unreliable**.

Just look at the wide range of download and upload speeds below. I re-ran these tests multiple times at different times of day (and overnight) and the speeds are very inconsistent in all test cases.

I have seen **multiple** reported chipset for this device in my research, and as I warn multiple times, there is [no guarantee that the card others receive will have the same chipset as mine]({{< relref "finding-linux-wifi-usb.markdown" >}}).

**Download Tests**

```
 0.0 -  3.3 Mbps | 16 +++++
 3.3 -  6.7 Mbps | 46 +++++++++++++++
 6.7 - 10.0 Mbps | 55 +++++++++++++++++
10.0 - 13.3 Mbps | 69 ++++++++++++++++++++++
13.3 - 16.7 Mbps | 92 ++++++++++++++++++++++++++++++
16.7 - 20.0 Mbps | 87 ++++++++++++++++++++++++++++
20.0 - 23.3 Mbps | 89 +++++++++++++++++++++++++++++
23.3 - 26.7 Mbps | 56 ++++++++++++++++++
26.7 - 30.0 Mbps | 26 ++++++++
30.0 - 33.3 Mbps | 19 ++++++
33.3 - 36.7 Mbps |  3
36.7 - 40.0 Mbps |  0
40.0 - 43.3 Mbps |  1
43.3 - 46.7 Mbps |  0
46.7 - 50.0 Mbps |  0
total: 559
max: 42.1666 Mbps
min: 1.33794 Mbps
average: 16.62 Mbps
```

**Upload Tests**

```
 0.0 -  3.3 Mbps |   1
 3.3 -  6.7 Mbps |   9
 6.7 - 10.0 Mbps | 383 ++++++++++++++++++++++++++++++
10.0 - 13.3 Mbps | 164 ++++++++++++
13.3 - 16.7 Mbps |   2
16.7 - 20.0 Mbps |   0
20.0 - 23.3 Mbps |   0
23.3 - 26.7 Mbps |   0
26.7 - 30.0 Mbps |   0
30.0 - 33.3 Mbps |   0
33.3 - 36.7 Mbps |   0
36.7 - 40.0 Mbps |   0
40.0 - 43.3 Mbps |   0
43.3 - 46.7 Mbps |   0
46.7 - 50.0 Mbps |   0
total: 559
max: 15.1124 Mbps
min: 3.18209 Mbps
average: 9.40 Mbps
```
