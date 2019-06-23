---
title: "Power Off Raspberry Pi Adafruit Resistive TFT Screen on Shutdown"
slug: power-off-raspberry-pi-adafruit-tft-screen-shutdown
date: 2017-08-06 00:00:00
lastmod: 2019-06-23 09:28:00
---

**Note that this article only applies to [backlight control for the resistive touchscreen](https://learn.adafruit.com/adafruit-pitft-28-inch-resistive-touchscreen-display-raspberry-pi/backlight-control) and that the [backlight control for the capacitive touchscreen](https://learn.adafruit.com/adafruit-2-8-pitft-capacitive-touch/backlight-control) is limited**

I have been enjoying the [Adafruit PiTFT 2.8" Resistive Touchscreen Display for Raspberry Pi](https://www.adafruit.com/product/2298). It is a nice, simple, touch display, and it has taught me a few distinctions regarding system power offs.

There is a kernel module called `rpi_power_switch` included with the Adafruit Raspbian Jessie image. That module is used to power the system on and off when a button on the TFT board is pressed. By default, the button is tied to GPIO pin `23`.

The button works great for me, but I noticed that the screen remains on when the system is powered "off". This led me to the distinction between **halting a system**, and **powering a system off**. Halting stops system activity and brings the machine to a state where the plug could be pulled safely. Powering off a machine means to halt and then also send a signal to cut the power.

Most modern PCs perform a halt, and also cut the power to the machine. I believe that the Pi does not support this because it does not support ACPI. So the Pi cannot really cut off its own power. This can only be done with [additional work](https://hackaday.com/2013/05/19/atx-raspi-is-a-smart-power-source-for-raspberry-pi/), or by pulling the plug.

I have never worked with kernel modules, but it [appears that](https://github.com/notro/fbtft_tools/commit/f478504e6aa0d5c2f8323c2db930e642e9a8b732#diff-13eddd5889911170728c27519916df70L328) the `rpi_power_switch` module overrides the standard power off function and _simulates_ halting the system in such a way that the TFT power button can be used.

> ... we will leave the CPU powered up here but not executing any code in order to simulate an "off" state.

The Pi enters a runlevel that is essentially halted, but can still respond to the TFT power button to turn the system back on (please correct me in the comments if I'm missing something).

You'll notice that `shutdown -h now` and `halt` do **not** put the system in the same state as pressing the TFT power button. If you run `shutdown -h now`, the power button **can not** be used to power the system back on. So something in that module is doing some magic to quasi-halt the system, but allow it to still respond to the button.

This is all well and dandy, but if the Pi can't kill its own power, how do we turn off the display? I would say the _best_ answer is to [enhance Adafruit's `rpi_power_switch` module](https://github.com/adafruit/adafruit-raspberrypi-linux/blob/rpi-4.9.y/drivers/power/reset/rpi_power_switch.c) to cut off power to the screen backlight during shutdown, but that may not be the desired behavior for all users. Though, that behavior could probably be made configurable using the `/etc/modprobe.d/adafruit.conf` file. Getting a proper power module for your Pi to kill the power on shutdown is also an option.

Barring those options, the shutdown behavior can be enhanced with a custom service. We can create a service that runs during shutdown to power off the backlight for the display screen.

<!-- more -->

Create a script at `/usr/local/bin/screen-off.sh` that will power off the screen's backlight.

```
#!/usr/bin/env bash

sudo sh -c '\
	echo "0" > /sys/class/backlight/soc\:backlight/brightness \
'
```

Make that script executable.

```
chmod +x /usr/local/bin/screen-off.sh
```

Create a service at `/etc/systemd/system/screen-off.service` that will run at shutdown.

The service will call our script that powers off the backlight on the screen.

```
[Unit]
Description=TFT Screen Off
Conflicts=reboot.target
After=network.target

[Service]
Type=oneshot
ExecStart=/bin/true
ExecStop=/usr/local/bin/screen-off.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

Enable the service. It will now run at shutdown when the TFT power button is pressed.

```
systemctl enable screen-off
```

Reboot the Pi. After it books, power it off using the TFT power button. You should see the screen go blank now when you press the power button.

When you power on the Pi again, the screen should illuminate like normal.

<span class="warning">I do want to emphasize that you should **not** confuse the screen being off and your Pi being off. Be very mindful that your screen will power off immediately during shutdown, and your Pi may still need a few seconds before it has safely halted.</span>

You can re-enable the screen by using `1` instead of `0` in the script above. And so you could easily create `screen-on.sh`. This is unecessary since the screen turns back on automatically at boot, but is worth noting.

# Citations

* [Tactile switch as power button](https://learn.adafruit.com/adafruit-pitft-28-inch-resistive-touchscreen-display-raspberry-pi/extras#tactile-switch-as-power-button)
* [sudo halt or sudo shutdown](https://www.raspberrypi.org/forums/viewtopic.php?f=27&t=30145)
* [Is halt the same as “shutdown -H” and poweroff the same as “shutdown -P”?](https://unix.stackexchange.com/questions/42572/is-halt-the-same-as-shutdown-h-and-poweroff-the-same-as-shutdown-p)
* [Systemd : How to execute script at shutdown only (not at reboot)](https://unix.stackexchange.com/questions/284598/systemd-how-to-execute-script-at-shutdown-only-not-at-reboot)
* [How to run a script with systemd right before shutdown?](https://unix.stackexchange.com/questions/39226/how-to-run-a-script-with-systemd-right-before-shutdown)
* [How to execute scripts in /usr/lib/systemd/system-shutdown/ at reboot or shutdown?](https://unix.stackexchange.com/questions/347306/how-to-execute-scripts-in-usr-lib-systemd-system-shutdown-at-reboot-or-shutdow)
