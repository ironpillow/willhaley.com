---
title: "T-Mobile Huawei Jet 2.0 in Windows 10 64-bit"
slug: t-mobile-huawei-jet-2.0-in-windows-10-64-bit
date: 2016-09-26 17:30:47
---

The T-Mobile Jet 2.0 is a USB 4G modem. If you connect it to a PC, it acts like a USB storage drive and includes installation software for the T-Mobile webConnect Manager. webConnect is what is typically used to manage the card and connect to the cell network to get a 4G connection for your PC.

Unfortunately, this software does not install properly in Windows 10. At least, not for me. In Windows 10 the software wizard runs, but hangs forever at the step `Installing Drivers ... Please Wait`.

![installing-drivers-forever](/images/t-mobile-huawei-jet-2.0-in-windows-10-64-bit/installing-drivers-forever.png)

I found a way around this by using the built in cellular connectivity features of Windows 10.

I will not say that these instructions are the _best_ way to get the Jet 2.0 working in Windows 10, but they worked for me.

<!-- more -->

First, connect the 4G card to your PC. Do *not* install the webConnect software when prompted. Instead, see if Windows 10 tries to automatically detect the modem and install drivers for you (it should).

![installing-device](/images/t-mobile-huawei-jet-2.0-in-windows-10-64-bit/installing-device.png)

Once Windows completes that process, install the webConnect software from the USB storage of the 4G card.

Eventually you'll get to the screen where the install hangs forever. When you get to that screen, force a hard shutdown of your computer. What I mean is, hold down the power button for 5 seconds until your computer is off.

Do *not* click Start -> Reboot. Do *not* use ctrl + alt + del. Do *not* hold down the power button for less than 5 seconds.

The only way to get the software to install (more or less) is to force that hard reboot when it gets stuck.

Power your PC back on.

Download the latest [webConnect](http://www.t-mobile.com/webconnectupgrade/) software for the `MBB T-Mobile Jet 2.0 4G Laptop Stick`.

Extract the downloaded file and open `jet2.0`. Run `DataCard_Setup64.exe`.

Now, I can't explain why, but for whatever reason, running that `exe` on my machine suddenly triggered Windows 10 to automatically install drivers for the card. What I mean is, rather than seeing the webConnect install wizard, I saw a Windows 10 driver prompt saying that it was `Installing HUAWEI Mobile Connect - USB Device (COM3)`.

![installing-properly](/images/t-mobile-huawei-jet-2.0-in-windows-10-64-bit/installing-properly.png)

I don't know why that happens. Maybe re-installing the software triggers something? Maybe it even has to do with the timing. Maybe trying to launch the software before the card is detected on reboot had something to do with it. I have no idea. All I know is that it worked.

Once that Windows/System driver prompt finishes successfully, reboot.

Now, go to view your network adapters. You should see an entry for the 4G card.

Go to your `Settings` menu in Windows 10. Then `Network & Internet`.

There should be a `Cellular` option on the left. Click it. Check the box that says `Connect automatically`, and then `Connect`.

![cellular-device](/images/t-mobile-huawei-jet-2.0-in-windows-10-64-bit/cellular-device.png)

If all worked properly, you should now be able to get online with your 4G card.

Note that we installed webConnect, but we're not actually using it. I _think_ that installing webConnect is necessary to get the proper drivers, but once installed, we'll just use the built in mechanism in Windows 10 to connect to 4G.
