---
title: "Linux on the Drift Ghost X Bike Camera"
date: 2019-04-17 20:11:00
---

I've been enjoying the quality and ease of use of the [Drift Ghost X camera](https://driftinnovation.com/collections/cameras-new/products/ghost-x) for my bicycle rides.

It is relatively affordable and simple. The camera is water resistant, and the waterproof case gives me confidence during a rain storm. Though, the waterproof case looks rather bulky and a little ridiculous I must admit.

I've found that the simplest way to dump video from the camera is by removing the SD card, but I wanted to share what I found while examining the Linux system installed on the camera.

The camera can be connected to via WiFi in order to use the [Drift Lite iOS app](https://itunes.apple.com/us/app/drift-life/id1052659378?mt=8). When the camera is in WiFi mode it creates an access point and the camera is accessible at `192.168.42.1`.

```
$ ping 192.168.42.1
PING 192.168.42.1 (192.168.42.1): 56 data bytes
64 bytes from 192.168.42.1: icmp_seq=0 ttl=64 time=10.693 ms
^C
--- 192.168.42.1 ping statistics ---
1 packets transmitted, 1 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 10.693/10.693/10.693/0.000 ms
```

The camera does not support ssh.

```
$ ssh 192.168.42.1
ssh: connect to host 192.168.42.1 port 22: Connection refused
```

Though, it does serve telnet as well as an HTTP endpoint.

```
$ nmap 192.168.42.1
Starting Nmap 7.70 ( https://nmap.org ) at 2019-04-02 18:44 CDT
mass_dns: warning: Unable to open /etc/resolv.conf. Try using --system-dns or specify valid servers with --dns-servers
mass_dns: warning: Unable to determine any DNS servers. Reverse DNS is disabled. Try using --system-dns or specify valid servers with --dns-servers
Nmap scan report for 192.168.42.1
Host is up (1.0s latency).
Not shown: 993 closed ports
PORT STATE SERVICE
23/tcp open telnet
53/tcp open domain
80/tcp open http
111/tcp open rpcbind
554/tcp open rtsp
8001/tcp open vcom-tunnel
9898/tcp open monkeycom

Nmap done: 1 IP address (1 host up) scanned in 129.05 seconds
```

As you may expect, `root` is the username for telnet connections.

```
$ telnet 192.168.42.1
Trying 192.168.42.1...
Connected to 192.168.42.1.
Escape character is '^]'.

a12 login: root
~ # whoami
root
~ # cd /
/ # ls
bin etc init lib32 media opt proc run sys usr
dev home lib linuxrc mnt pref root sbin tmp var
```

All the media can be found at `/var/www/DCIM/100MEDIA/`

```
/var/www/DCIM # cd /var/www/DCIM/100MEDIA/
/var/www/DCIM/100MEDIA # ls
VID00001.MP4 VID00002.MP4 VID00003.MP4 VID00004.MP4 VID00005.MP4 VID00006.MP4 VID00007.MP4 VID00008.MP4 VID00009.MP4
VID00001_thm.MP4 VID00002_thm.MP4 VID00003_thm.MP4 VID00004_thm.MP4 VID00005_thm.MP4 VID00006_thm.MP4 VID00007_thm.MP4 VID00008_thm.MP4 VID00009_thm.MP4
```

The running processes are fairly bare bones.

```
~ # ps
PID USER TIME COMMAND
1 root 0:00 init
2 root 0:00 [kthreadd]
3 root 0:02 [ksoftirqd/0]
5 root 0:00 [kworker/0:0H]
6 root 0:00 [kworker/u2:0]
7 root 0:03 [rcu_preempt] [155/430]
8 root 0:00 [rcu_bh]
9 root 0:00 [rcu_sched]
10 root 0:00 [khelper]
11 root 0:00 [kdevtmpfs]
12 root 0:00 [kworker/u2:1]
146 root 0:00 [writeback]
149 root 0:00 [bioset]
150 root 0:00 [crypto]
152 root 0:00 [kblockd]
162 root 0:00 [kworker/0:1]
254 root 0:00 [rpciod]
267 root 0:00 [kswapd0]
268 root 0:00 [fsnotify_mark]
269 root 0:00 [nfsiod]
359 root 0:00 [krfcommd]
363 root 0:00 [deferwq]
366 root 0:00 [kworker/0:1H]
367 root 0:01 [kworker/0:2]
389 root 0:00 /usr/bin/rpcbind
419 root 0:00 /usr/bin/ipcbind -b
421 root 0:00 /usr/bin/util_svc -b
425 root 0:00 /usr/bin/AmbaNetFifoDaemon
429 root 0:00 /usr/bin/AmbaEventNotifyDaemon
438 root 0:00 [cfg80211]
447 root 0:00 [khubd]
459 root 0:00 telnetd
473 root 0:00 /usr/bin/remoteapi_disc_daemon
474 root 0:00 httpd -f -p 80 -h /var/www/
483 root 0:00 -/bin/sh
484 root 0:00 /usr/bin/remoteapi_cmd_daemon
489 root 0:00 /usr/bin/remoteapi_data_daemon
494 root 0:00 /usr/bin/remoteapi_syssvc_daemon
499 root 0:00 /usr/bin/AmbaRTSPServer
658 root 0:03 [RTW_CMD_THREAD]
685 nobody 0:00 dnsmasq --nodns -5 -K -R -n --dhcp-range=192.168.42.2,192.168.42.21,infinite
710 root 0:00 hostapd -B /tmp/hostapd.conf
716 root 0:10 /usr/bin/stream_daemon
724 root 0:09 example_framer
5991 root 0:00 -sh
6007 root 0:00 ps
```

The configs give us some clues about the HTTP server. This device is running a [cherokee](http://cherokee-project.com/) web server.

```
~ # ls /etc/
TZ fstab hosts inputrc ld.so.conf mdev.conf network passwd random-seed shadow
cherokee.conf group init.d issue ld.so.conf.d mtab nsswitch.conf ppp resolv.conf ssl
dropbear hostname inittab ld.so.cache libnl netconfig os-release protocols services
```

It runs a number of standard Linux binaries as well as busybox, which you may expect from a small embedded Linux device.

```
~ # wget
BusyBox v1.23.2 (2018-11-28 15:25:18 CST) multi-call binary.

Usage: wget [-c|--continue] [-s|--spider] [-q|--quiet] [-O|--output-document FILE]
[--header 'header: value'] [-Y|--proxy on/off] [-P DIR]
[-U|--user-agent AGENT] [-T SEC] URL...

Retrieve files via HTTP or FTP

-s Spider mode - only check file existence
-c Continue retrieval of aborted transfer
-q Quiet
-P DIR Save to DIR (default .)
-T SEC Network read timeout is SEC seconds
-O FILE Save to FILE ('-' for stdout)
-U STR Use STR for User-Agent header
-Y Use proxy ('on' or 'off')
```

I did not take much time to dive into the filesystem layout.

```
~ # df -h
Filesystem Size Used Available Use% Mounted on
/dev/root 17.8M 17.8M 0 100% /
devtmpfs 19.2M 0 19.2M 0% /dev
tmpfs 19.3M 0 19.3M 0% /dev/shm
tmpfs 19.3M 28.0K 19.3M 0% /tmp
a: 13.8M 40.0K 13.8M 0% /tmp/FL0
c: 238.2G 23.6G 214.7G 10% /tmp/SD0
a: 13.8M 40.0K 13.8M 0% /pref
c: 238.2G 23.6G 214.7G 10% /var/www/DCIM
```

The camera does not have `netcat`, which makes copying files a bit tricky. Also, the filesystems appear to be squashfs or something similar that does not allow writing. It is probably booting from an integrated storage device that I didn't bother trying to dive into. There's no build environment or package management. `wget` seems the simplest solution to install any binaries. Although the idea was temping, at this point I felt trying to install and run my own web UI or similar was overkill and I'd be better off just removing the SD card like a normal user when I wanted to dump files :D

Some interesting product configuration is available at `/tmp/FL0/pref/product.cfg` for the camera.

You could potentially do something like this to populate a list of files and download from the camera on a *nix system.

```
#!/usr/bin/env expect

spawn telnet 192.168.42.1
expect "a12 login:"
send "root\r"
expect "~ #"
send "ls /var/www/DCIM/100MEDIA\r"
expect "~ #"

#!/usr/bin/env bash
for i in `seq 1 $1`;
do
    # Full video
    wget http://192.168.42.1/DCIM/100MEDIA/VID00001.MP4
    # Video thumbnail
    wget http://192.168.42.1/DCIM/100MEDIA/VID00001_thm.MP4
done
```

Always fun to poke around on a Linux box!
