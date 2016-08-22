---
title: "Use a Static IP in Arch Linux with dhcpcd"
slug: static-ip-in-arch-linux
date: 2016-12-28 11:11:12
---

I am assuming that your Arch Linux system is using, or will use, `dhcpcd`. If you are using `systemd-networkd`, you will have to disable it to switch to `dhcpcd`.

```
systemctl disable systemd-networkd
systemctl stop systemd-networkd
```

Install `dhcpcd` and enable it at boot. Be careful. If this is a remote machine, and you screw something up and reboot, you may not be able to reconnect.

```
pacman -Sy dhcpcd
systemctl enable dhcpcd
systemctl start dhcpcd
```

Before assigning the static IP, make sure of the following:

1. No other machines on the network shares the static IP you plan to use.
1. You assign the static IP to the appropriate network interface.
1. The static IP is reserved (not handed out to another machine) by your DHCP server.

See network interface devices with either `ip addr` or `ls /sys/class/net/`.

In my case, I want to assign a static IP of `192.168.1.2` to interface `enp0s3`.

Save the appropriate settings in `/etc/dhcpcd.conf`. You can use different DNS information than Google DNS (what I am using below) if you prefer.

```
# /etc/dhcpcd.conf
interface enp0s3
static ip_address=192.168.1.2/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8 8.8.4.4
```

I _think_ `dhcpcd` will pick up on those changes automatically, but you can also give it a kick by rebooting or restarting the service.

```
systemctl restart dhcpcd
```
