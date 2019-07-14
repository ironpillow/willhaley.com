---
title: "Raspberry Pi 3 B+ WiFi Ethernet Bridge"
date: 2018-04-14 15:16:00
lastmod: 2019-07-14 11:32:00
---

The goal is to connect a **non-WiFi** computer to a WiFI network via a Raspberry Pi. We will use a Raspberry Pi 3 B+ as a bridge between the **non-WiFi** computer and the WiFi network. The Raspberry Pi connects to WiFi and shares its connection with other computers using Ethernet.

![diagram of the network topology](/assets/raspberry-pi-wifi-ethernet-bridge/wifi-bridge.png)

The Raspberry Pi 3 B+ has [802.11ac WiFi](https://www.raspberrypi.org/blog/raspberry-pi-3-model-bplus-sale-now-35/), and so seems well suited to this task. This [Stack Overflow answer](https://raspberrypi.stackexchange.com/a/50073/24566) and [accompanying script](https://raw.githubusercontent.com/arpitjindal97/raspbian-recipes/master/wifi-to-eth-route.sh) as well as [this proxy arp approach](https://raspberrypi.stackexchange.com/a/88955/24566) and [Debian's Bridging Network Connections with Proxy ARP](https://wiki.debian.org/BridgeNetworkConnectionsProxyArp) are the primary sources for how I got this working and are the inspiration for this guide.

I have two _separate_ guides below. Follow either the `Same Subnet` steps **or** the `Separate Subnet` steps below based on the configuration you would prefer. My process has evolved over time and I prefer the `Same Subnet` approach as it is meant to be a seamless bridge for clients.

# Option 1 - Same Subnet

The following script configures everything in one go for a standard Raspbian-based Raspberry Pi. This script is based off a [very helpful Stack Overflow answer](https://raspberrypi.stackexchange.com/a/88955/24566). The only changes you should need to make are for the `ssid` and `psk` variables used for connecting the Pi to your WiFi network.

**Note: This script drastically changes the networking configuration and your Pi may end up in an unreliable networking state if anything goes wrong**

```
#!/usr/bin/env bash

set -e

[ $EUID -ne 0 ] && echo "run as root" >&2 && exit 1

# Update these variables as needed

ssid="the ssid"
psk="the password"
country="US"

# You should not need to update anything below this line

apt update && apt install parprouted dhcp-helper

systemctl stop dhcp-helper
systemctl enable dhcp-helper

systemctl mask networking.service
systemctl mask dhcpcd.service
if [ -d /etc/network/interfaces ];
then
  mv /etc/network/interfaces /etc/network/interfaces.bak
fi
sed -i '1i resolvconf=NO' /etc/resolvconf.conf

systemctl enable systemd-networkd.service
systemctl enable systemd-resolved.service
ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf

cat > /etc/wpa_supplicant/wpa_supplicant-wlan0.conf <<EOF
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=${country}

network={
    ssid="${ssid}"
    psk="${psk}"
}
EOF

chmod 600 /etc/wpa_supplicant/wpa_supplicant-wlan0.conf
systemctl disable wpa_supplicant.service
systemctl enable wpa_supplicant@wlan0.service

cat > /etc/systemd/network/08-wlan0.network <<EOF
[Match]
Name=wlan0
[Network]
DHCP=yes
IPForward=yes
EOF

cat > /etc/default/dhcp-helper <<EOF
DHCPHELPER_OPTS="-b wlan0"
EOF

cat <<'EOF' >/etc/avahi/avahi-daemon.conf
[server]
use-ipv4=yes
use-ipv6=yes
ratelimit-interval-usec=1000000
ratelimit-burst=1000

[wide-area]
enable-wide-area=yes

[publish]
publish-hinfo=no
publish-workstation=no

[reflector]
enable-reflector=yes

[rlimits]
EOF

cat <<'EOF' >/etc/systemd/system/parprouted.service
[Unit]
Description=proxy arp routing service
Documentation=https://raspberrypi.stackexchange.com/q/88954/79866

[Service]
Type=forking
# Restart until wlan0 gained carrier
Restart=on-failure
RestartSec=5
TimeoutStartSec=30
ExecStartPre=/lib/systemd/systemd-networkd-wait-online --interface=wlan0 --timeout=6 --quiet
ExecStartPre=/bin/echo 'systemd-networkd-wait-online: wlan0 is online'
# clone the dhcp-allocated IP to eth0 so dhcp-helper will relay for the correct subnet
ExecStartPre=/bin/bash -c '/sbin/ip addr add $(/sbin/ip -4 -br addr show wlan0 | /bin/grep -Po "\\d+\\.\\d+\\.\\d+\\.\\d+")/32 dev eth0'
ExecStartPre=/sbin/ip link set dev eth0 up
ExecStartPre=/sbin/ip link set wlan0 promisc on
ExecStart=-/usr/sbin/parprouted eth0 wlan0
ExecStopPost=/sbin/ip link set wlan0 promisc off
ExecStopPost=/sbin/ip link set dev eth0 down
ExecStopPost=/bin/bash -c '/sbin/ip addr del $(/sbin/ip -4 -br addr show eth0 | /bin/grep -Po "\\d+\\.\\d+\\.\\d+\\.\\d+")/32 dev eth0'

[Install]
WantedBy=wpa_supplicant@wlan0.service
EOF

systemctl daemon-reload
systemctl enable parprouted.service

systemctl start wpa_supplicant@wlan0 dhcp-helper systemd-networkd systemd-resolved
```

# Option 2 - Separate Subnet

Become `root` on the Raspberry Pi. This will make the following steps a little bit simpler.

```
sudo su
```

[Connect to WiFi](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md) on the Raspberry Pi.

To connect to a 5Ghz network on the 3 B+ you [must specify the country code](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md) in the `/etc/wpa_supplicant/wpa_supplicant.conf` config file.

You can either manually update `wpa_supplicant.conf` or use `raspi-config` to configure WiFi. This is an example of what my `wpa_supplicant.conf` looks like.

```
# /etc/wpa_supplicant/wpa_supplicant.conf
country=US
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="YOUR SSID"
    psk="YOUR PASSWORD"
}
```

I manually configured WiFi on my Pi, and found that I had to run the following commands.

```
systemctl enable wpa_supplicant && \
    rfkill unblock wifi && \
    systemctl restart dhcpcd
```

Once your Raspberry Pi is connected to the local WiFi network, install `dnsmasq`.

```
apt-get update && apt-get install dnsmasq
```

Create a diretcory where we will store our `iptables` rules.

```
mkdir -p /etc/iptables
```

Create `iptables` rules by running this command to generate a `rules.v4` file.

```
cat <<'EOF' >/etc/iptables/rules.v4
# Generated by iptables-save v1.6.0 on Sat Apr 14 22:29:00 2018
*nat
:PREROUTING ACCEPT [98:9304]
:INPUT ACCEPT [98:9304]
:OUTPUT ACCEPT [2:152]
:POSTROUTING ACCEPT [0:0]
-A POSTROUTING -o wlan0 -j MASQUERADE
COMMIT
# Completed on Sat Apr 14 22:29:00 2018
# Generated by iptables-save v1.6.0 on Sat Apr 14 22:29:00 2018
*filter
:INPUT ACCEPT [791:83389]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [333:34644]
-A FORWARD -i wlan0 -o eth0 -m state --state RELATED,ESTABLISHED -j ACCEPT
-A FORWARD -i eth0 -o wlan0 -j ACCEPT
COMMIT
# Completed on Sat Apr 14 22:29:00 2018
EOF
```

Create a script to load our `iptables` forwarding rules at [each boot](https://major.io/2009/11/16/automatically-loading-iptables-on-debianubuntu/).

```
cat <<'EOF' >/etc/network/if-up.d/iptables
#!/bin/sh
iptables-restore < /etc/iptables/rules.v4
EOF
```

Make our script executable.

```
chmod +x /etc/network/if-up.d/iptables
```

[Enable](http://www.ducea.com/2006/08/01/how-to-enable-ip-forwarding-in-linux/) persistent `ipv4` forwarding for each system boot.

```
sed -i'' \
    s/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/ \
    /etc/sysctl.conf
```

Create a static IP address configuration. The `eth0` adapter will use a static IP of `10.1.1.1` on this new subnet.

```
cat <<'EOF' >/etc/network/interfaces.d/eth0
auto eth0
allow-hotplug eth0
iface eth0 inet static
  address 10.1.1.1
  netmask 255.255.255.0
  gateway 10.1.1.1
EOF
```

Create a `dnsmasq` DHCP config at `/etc/dnsmasq.d/bridge.conf`. The Raspberry Pi will act as a DHCP server to the client connected over ethernet. The DNS server will be `8.8.8.8` (Google's DNS) and the range will start at `10.1.1.2`.

```
cat <<'EOF' >/etc/dnsmasq.d/bridge.conf
interface=eth0
bind-interfaces
server=8.8.8.8
domain-needed
bogus-priv
dhcp-range=10.1.1.2,10.1.1.254,12h
EOF
```

Reboot.

```
reboot
```

View our current iptables to verify that they are loading at boot as needed.

```
iptables -L
```

You should now be able to connect a device to the ethernet port on the Raspberry Pi and receive an IP address.

I ran some **very basic** speed tests for my desktop connected through the Raspberry Pi bridge and was pleasantly surprised by the results.

I cannot guarantee how reliable this is for longterm use, but it seems promising.

```
$ iperf3 --reverse --format m --version4 --client iperf.he.net
Connecting to host iperf.he.net, port 5201
Reverse mode, remote host iperf.he.net is sending
[  6] local 10.1.1.187 port 52264 connected to 216.218.227.10 port 5201
[ ID] Interval           Transfer     Bitrate
[  6]   0.00-1.00   sec  2.06 MBytes  17.3 Mbits/sec
[  6]   1.00-2.00   sec  7.57 MBytes  63.5 Mbits/sec
[  6]   2.00-3.00   sec  8.46 MBytes  71.0 Mbits/sec
[  6]   3.00-4.00   sec  8.48 MBytes  71.2 Mbits/sec
[  6]   4.00-5.00   sec  8.49 MBytes  71.2 Mbits/sec
[  6]   5.00-6.00   sec  6.32 MBytes  53.0 Mbits/sec
[  6]   6.00-7.00   sec  8.54 MBytes  71.6 Mbits/sec
[  6]   7.00-8.00   sec  8.06 MBytes  67.6 Mbits/sec
[  6]   8.00-9.00   sec  6.92 MBytes  58.0 Mbits/sec
[  6]   9.00-10.00  sec  7.73 MBytes  64.9 Mbits/sec
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  6]   0.00-10.00  sec  77.6 MBytes  65.1 Mbits/sec  809             sender
[  6]   0.00-10.00  sec  72.6 MBytes  60.9 Mbits/sec                  receiver

iperf Done.
```

![speed results](/images/raspberry-pi-wifi-ethernet-bridge/speed.png)
