---
title: "Restore Stock Firmware To Netgear WNR2000v3 After DD-WRT"
slug: restore-stock-firmware-wnr2000v3
date: 2017-08-22 00:00:00
---

[DD-WRT](https://www.dd-wrt.com/site/), [OpenWRT](https://openwrt.org/), and [LEDE](https://lede-project.org/) are excellent firmware replacements for an access point. The [Netgear WNR2000v3 DD-WRT Wiki](https://www.dd-wrt.com/wiki/index.php/Netgear_WNR2000V3) is very helpful in the setup process for that router (OpenWRT and LEDE require more Flash space and did _not_ run properly on this router in my testing).

Despite how well DD-WRT works for this device, I wanted to restore the stock firmeware so that I could test it for security vulnerabilities. I was curious how easy it might be to hack it if I did not have DD-WRT.

I was using DD-WRT version `v24-sp2 (03/19/12) std`.

First, download the stock Netgear firmware for the device. I do not know if a specific version is best, but I found that [Firmware Version 1.0.1.26 (NA and WW Users)](https://www.netgear.com/support/product/WNR2000v3.aspx#Firmware Version 1.0.1.26 (NA and WW Users)) worked perfectly.

_On Netgear's site, click the `Downloads` button then `+ View Previous Versions` link to see all available firmeware._

Once you have unzipped the `img` file from the downloaded firmware `zip` file, you can hold down the reset button on the router for 30 seconds. The power button should flash.

_If that does not work, try powering off the router, holding down reset, and powering it on. The light should flash orange, then green. After it flashes green 10 times, you can release the reset button._

If you are wired in with a static IP, you should now be able to flash the router.

You can use `atftp` to push that firmware to your router.

```
atftp \
	--option "mode octet" \
	--verbose \
	--put \
	--local-file wnr2000v3-V1.0.1.26.img \
	192.168.1.1
```

Wait several minutes. Eventually, the router should be available at `http://192.168.1.1` with the stock firmware.

The default username is `admin` and the default password is `password`. If you choose not to use DD-WRT, be sure to immediately close all security flaws on your router!

Change the admin password, upgrade the firmware, secure your WiFi, disable remote management, and reconsider using DD-WRT.

# Citations

* [Netgear WNR2000V3](https://www.dd-wrt.com/wiki/index.php/Netgear_WNR2000V3)
* [Netgear WNR2000 v3 Quesiton](https://www.dd-wrt.com/phpBB2/viewtopic.php?t=172030)
* [WNR2000v3 - N300 Wireless Router](https://www.netgear.com/support/product/WNR2000v3.aspx)
* [TFTP Flash](https://www.dd-wrt.com/wiki/index.php/Tftp_flash)
* [How To Unbrick Your Trashed WRT54G Linksys Router](http://www.makeuseof.com/tag/unbrick-trashed-linksys-router/)
