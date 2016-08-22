---
title: "Raspberry Pi Hotspot With The Edimax EW-7811Un (RTL8188CUS chipset)"
slug: raspberry-pi-hotspot-ew7811un-rtl8188cus
date: 2013-05-01 22:11:00
date_modified: 2015-01-18 00:00:00
disqus: true
---

These instructions are meant to help you use your Raspberry Pi as a WiFi hotspot (wireless access point) using an Edimax EW-7811Un wireless network adapter.  This will allow your Raspberry Pi to share it's wired network connection over WiFi.

Please keep in mind that you must already have a working wired network connection to your Raspberry Pi for these instructions to be meaningful. These instructions will not circumvent your need to obtain an initial connection to the Internet or LAN for your Raspberry Pi to share.

**Updated 2015-01-18** *Instructions updated and tested against a Raspberry Pi B+ using the latest version of Raspbian/Debian Wheezy.  I have not tested these instructions against any other platform.*

Required:

* Familiarity with the terminal
* Edimax EW-7811Un WiFi USB adapter (RTL8188CUS chipset)
  * **Use a USB powered hub or make sure you have a high amperage power supply!**
* Raspberry Pi with Raspbian installed
* A working wired Internet connection to your Raspberry Pi

<!-- more -->

Run the following commands on your Raspberry Pi

1. Install required software

    ```
    sudo apt-get install bridge-utils hostapd
    ```

1. Grab a custom copy of `hostapd` that is compatible with the RTL8188CUS chipset.

    ```
    wget http://dl.dropbox.com/u/1663660/hostapd/hostapd.zip
    ```

    Thanks to the [Techy Findings blog](http://blog.sip2serve.com/) and their article on [using the Raspberry Pi and hostapd with the RTL8192cu chipset](http://blog.sip2serve.com/post/38010690418/raspberry-pi-access-point-using-rtl8192cu).  These instructions of mine would not work without the custom `hostapd` binary provided in [that article](http://blog.sip2serve.com/post/38010690418/raspberry-pi-access-point-using-rtl8192cu).

    I would like to point out that [their custom binary](http://dl.dropbox.com/u/1663660/hostapd/hostapd.zip) is a few years old at this point, but it certainly works.

1. Backup the standard/default `hostapd` binary that we installed earlier and replace it with the custom one. You should be able to copy and paste this whole block into the terminal as one command.

    ```
    unzip hostapd.zip && \
    sudo mv /usr/sbin/hostapd /usr/sbin/hostapd.original && \
    sudo mv hostapd /usr/sbin/hostapd.edimax && \
    sudo ln -sf /usr/sbin/hostapd.edimax /usr/sbin/hostapd && \
    sudo chown root.root /usr/sbin/hostapd && \
    sudo chmod 755 /usr/sbin/hostapd
    ```

1. Make a bridged interface between `eth0` and `wlan0` (I am assuming your wired and wireless nics are `eth0` and `wlan0`, respectively). Edit `/etc/network/interfaces` so that it looks like the following.

    ```
    auto lo

    iface lo inet loopback
    iface eth0 inet dhcp

    allow-hotplug wlan0
    iface wlan0 inet manual
    #wpa-roam /etc/wpa_supplicant/wpa_supplicant.conf
    #iface default inet dhcp

    auto br0
    iface br0 inet dhcp
    bridge_ports eth0 wlan0
    ```

    Keep in mind that this is based on the stock `interfaces` file in Raspbian.  If you're not using Raspbian or if you are using an older version of Raspbian, or have modified this file previously, then you may want to use caution!

    The important part is that I commented out two lines and added the three lines at the bottom for the bridged adapter.

1. Restart the Pi.

    ```
    sudo reboot
    ```

1. Create ```/etc/hostapd/hostapd.conf``` so that it looks like this.

    **Make sure you update the `ssid` and `wpa_passphrase` variables!  Use whatever id and password you prefer.**

    ```
    interface=wlan0
    driver=rtl871xdrv
    bridge=br0
    ssid=THENAMEOFTHENETWORK
    channel=6
    wmm_enabled=0
    wpa=1
    wpa_passphrase=THEPASSWORD
    wpa_key_mgmt=WPA-PSK
    wpa_pairwise=TKIP
    rsn_pairwise=CCMP
    auth_algs=1
    macaddr_acl=0
    ```

    This config file was based on something I found on another blog and I do not have an in-depth understanding of each variable, so I will leave it to you to research and adjust these variables (at your own risk).

1. Start `hostapd` manually as a test that we can see the access point and connect to it.

    ```
    sudo hostapd -dd /etc/hostapd/hostapd.conf
    ```

    It may take a few moments before the WiFi network is visible.

    Try using your phone, laptop, or whatever test device you have on hand.  You should be able to connect using the ssid and password specified in the `hostapd.conf` file above.

1. Assuming all went well for you and *if* you want hostapd to run at startup, then you can update ```/etc/default/hostapd``` so that the line that says ```DAEMON_CONF``` is uncommented and points to your configuration file.

    ```
    DAEMON_CONF="/etc/hostapd/hostapd.conf"
    ```

If you are having any issues getting this to work, I suggest you make sure all of your config options are set correctly.  As I mentioned above I have only tested this on one device with one, brand new and unmodified, installation of the OS, so it may not cover your setup, but hopefully it will point you in the proper direction.

[This article at nixCraft](http://www.cyberciti.biz/faq/debian-ubuntu-linux-setting-wireless-access-point/) was a helpful resource for configuring hostapd.
