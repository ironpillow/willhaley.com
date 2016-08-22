---
title: "Resolvconf DNS Issue After Ubuntu Xenial Upgrade"
slug: resolvconf-dns-issue-after-ubuntu-xenial-upgrade
date: 2016-09-10 07:45:08
disqus: true
---

After [following DigitalOcean's guide for upgrading to Ubuntu Xenial](https://www.digitalocean.com/community/tutorials/how-to-upgrade-to-ubuntu-16-04-lts) I hit a snag. DNS was broken. I do not see this as a fault of DigitalOcean, but more likely an issue with Ubuntu.

### Update: 2017-06-27

As Uğur Çetin mentions in the comments below, there is a simpler fix for this.

Find the IP address of your mirror and create an `/etc/hosts` entry for it.

Then simply run `apt upgrade`.

Done! Once resolvconf is working properly again, you should be able to comment out or remove the `/etc/hosts` entry you created for the mirror.

### Original steps and explanation

It was not until I went to use `apt-get`, days after my Xenial upgrade, that I realized something was wrong. I went to install a package with apt and found it would not work. Ubuntu claimed apt was in use. Since I'm the only user of this server, I quickly realized something must have gotten stuck after the Xenial upgrade and that I didn't reboot or otherwise see the issue at the time of the upgrade.

```
ps ax | grep -i dpkg
```

For whatever reason, `dpkg` was still tying things up.

Without thinking, I threw my typical `dpkg` and `apt` brute force fixes into the mix.

```
sudo dpkg --configure -a
sudo apt-get install -f
```

That seemed to work to get apt "unstuck", but then when I tried to do an `apt-get update` I realized that DNS was broken. All of the `apt-get update` requests were coming back as 404s.

```
ping google.com
ping: unknown host google.com
```

I tried to restart `resolvconf`, but saw it was failing.

```
sudo systemctl start resolvconf
Job for resolvconf.service failed because the control process exited with error code. See "systemctl status resolvconf.service" and "journalctl -xe" for details.
```

No `resolv.conf` file was available.

```
cat /etc/resolv.conf
cat: /etc/resolv.conf: No such file or directory

ls -al /etc/resolv.conf
lrwxrwxrwx 1 root root 29 Aug 30 00:12 /etc/resolv.conf -> ../run/resolvconf/resolv.conf

ls -al /run/resolvconf/resolv.conf
ls: cannot access /run/resolvconf/resolv.conf: No such file or directory
```

Everything looked fine in `/etc/network/interfaces`.

```
# This file describes the network interfaces available on your
# system and how to activate them. For more information, see
# interfaces(5).

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
auto eth0
iface eth0 inet static
        address REDACTED
        netmask 255.255.192.0
        gateway REDACTED
        dns-nameservers 8.8.8.8 8.8.4.4
```

So I dug a bit deeper into the service error.

```
sudo systemctl status resolvconf.service
● resolvconf.service - LSB: Nameserver information manager
   Loaded: loaded (/etc/init.d/resolvconf; bad; vendor preset: enabled)
   Active: failed (Result: exit-code) since Tue 2016-08-30 11:21:54 EDT; 1min 22s ago
     Docs: man:systemd-sysv-generator(8)
  Process: 3740 ExecStart=/etc/init.d/resolvconf start (code=exited, status=1/FAILURE)

Aug 30 11:21:54 www systemd[1]: Starting LSB: Nameserver information manager...
Aug 30 11:21:54 www resolvconf[3740]:  * Setting up resolvconf...
Aug 30 11:21:54 www resolvconf[3740]: mkdir: cannot create directory ‘’: No such file or directory
Aug 30 11:21:54 www resolvconf[3740]: resolvconf: Error: Error creating directory
Aug 30 11:21:54 www resolvconf[3740]:    ...fail!
Aug 30 11:21:54 www systemd[1]: resolvconf.service: Control process exited, code=exited status=1
Aug 30 11:21:54 www systemd[1]: Failed to start LSB: Nameserver information manager.
Aug 30 11:21:54 www systemd[1]: resolvconf.service: Unit entered failed state.
Aug 30 11:21:54 www systemd[1]: resolvconf.service: Failed with result 'exit-code'.
```

That error was not much help, so I decided to search around on my system to see if I could find which script or config was throwing that error.

```
grep -irn 'error creating directory' /etc/init/
grep -irn 'error creating directory' /etc/init.d/
```

Eventually I found it under `/sbin`. I didn't realize that `resolvconf` was a script and not a binary. Good to know!

```
grep -irn 'error creating directory' /sbin/
/sbin/resolvconf:60:   		mkdir "$RUN_CANONICALDIR" || { report_err "Error creating directory $RUN_CANONICALDIR" ; exit 1 ; }
/sbin/resolvconf:64:   		mkdir "${RUN_DIR}/interface" || { report_err "Error creating directory ${RUN_DIR}/interface" ; exit 1 ; }
```

Based on the script it seemed like the issue was with `RUN_CANONICALDIR` not being defined. I could not find that variable anywhere in `/sbin/resolvconf`.

I did some more searching for it.

```
grep -irn 'RUN_CANONICALDIR' /etc/init/
grep -irn 'RUN_CANONICALDIR' /etc/init.d/
grep -irn 'RUN_CANONICALDIR' /sbin/
/sbin/resolvconf:60:   		mkdir "$RUN_CANONICALDIR" || { report_err "Error creating directory $RUN_CANONICALDIR" ; exit 1 ; }
grep -irn 'RUN_CANONICALDIR' /bin/
grep -irn 'RUN_CANONICALDIR' /usr/lib/systemd/system/
grep: /usr/lib/systemd/system/: No such file or directory
grep -irn 'RUN_CANONICALDIR' /etc/systemd/
```

No luck. The only reference I could find for it was in `/sbin/resolvconf`. I could not figure out what was supposed to be setting that variable.

That's when I discovered the root issue. I used `apt-get` to determine which version of `resolvconf` was installed and realized that something was very wrong.

```
apt-get -s install resolvconf
NOTE: This is only a simulation!
      apt-get needs root privileges for real execution.
      Keep also in mind that locking is deactivated,
      so don't depend on the relevance to the real current situation!
Reading package lists... Done
Building dependency tree
Reading state information... Done
resolvconf is already the newest version (1.69ubuntu1.1).
0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
```

I researched what the [version of `resolvconf` for Xenial](http://packages.ubuntu.com/xenial/resolvconf) was _supposed_ to be (`1.78ubuntu2`) and realized that my version (`1.69ubuntu1.1`) was out of date. It was somehow held back during the upgrade.

Because I had no DNS, I couldn't use apt to upgrade it.

That's when I thought that perhaps I could _manually_ install a version of `resolvconf` that would be compatible with my system. I was able to [find a mirror](http://packages.ubuntu.com/xenial/all/resolvconf/download) for the Xenial `resolvconf` `deb` file I needed, but again, DNS was a problem. I could not download from a mirror using a hostname, so I had to get the IP for the server by pinging the hostname from a working machine.

Once I had the URL for a mirror using the IP address, I was able to download the `deb` package from my problematic Xenial server using `wget`, and then I could manually install it with `dpkg`.

```
sudo dpkg -i resolvconf_1.78ubuntu2_all.deb
(Reading database ... 90362 files and directories currently installed.)
Preparing to unpack resolvconf_1.78ubuntu2_all.deb ...
Unpacking resolvconf (1.78ubuntu2) over (1.69ubuntu1.1) ...
Setting up resolvconf (1.78ubuntu2) ...
Installing new version of config file /etc/dhcp/dhclient-enter-hooks.d/resolvconf ...
Installing new version of config file /etc/init.d/resolvconf ...
Installing new version of config file /etc/network/if-down.d/resolvconf ...
Installing new version of config file /etc/network/if-up.d/000resolvconf ...
Installing new version of config file /etc/ppp/ip-down.d/000resolvconf ...
Installing new version of config file /etc/ppp/ip-up.d/000resolvconf ...
Installing new version of config file /etc/resolvconf/interface-order ...
Installing new version of config file /etc/resolvconf/update.d/libc ...
Processing triggers for systemd (229-4ubuntu7) ...
Processing triggers for ureadahead (0.100.0-19) ...
Processing triggers for man-db (2.6.7.1-1ubuntu1) ...
Processing triggers for resolvconf (1.78ubuntu2) ...
```

I was able to start the service after the install.

```
sudo systemctl status resolvconf
● resolvconf.service - Nameserver information manager
   Loaded: loaded (/lib/systemd/system/resolvconf.service; enabled; vendor preset: enabled)
   Active: failed (Result: exit-code) since Tue 2016-08-30 11:21:54 EDT; 25min ago
     Docs: man:resolvconf(8)

Aug 30 11:21:54 www systemd[1]: Starting LSB: Nameserver information manager...
Aug 30 11:21:54 www resolvconf[3740]:  * Setting up resolvconf...
Aug 30 11:21:54 www resolvconf[3740]: mkdir: cannot create directory ‘’: No such file or directory
Aug 30 11:21:54 www resolvconf[3740]: resolvconf: Error: Error creating directory
Aug 30 11:21:54 www resolvconf[3740]:    ...fail!
Aug 30 11:21:54 www systemd[1]: resolvconf.service: Control process exited, code=exited status=1
Aug 30 11:21:54 www systemd[1]: Failed to start LSB: Nameserver information manager.
Aug 30 11:21:54 www systemd[1]: resolvconf.service: Unit entered failed state.
Aug 30 11:21:54 www systemd[1]: resolvconf.service: Failed with result 'exit-code'.

sudo systemctl start resolvconf

sudo systemctl status resolvconf
● resolvconf.service - Nameserver information manager
   Loaded: loaded (/lib/systemd/system/resolvconf.service; enabled; vendor preset: enabled)
   Active: active (exited) since Tue 2016-08-30 11:47:32 EDT; 1s ago
     Docs: man:resolvconf(8)
  Process: 5125 ExecStart=/sbin/resolvconf --enable-updates (code=exited, status=0/SUCCESS)
  Process: 5123 ExecStartPre=/bin/touch /run/resolvconf/postponed-update (code=exited, status=0/SUCCESS)
  Process: 5120 ExecStartPre=/bin/mkdir -p /run/resolvconf/interface (code=exited, status=0/SUCCESS)
 Main PID: 5125 (code=exited, status=0/SUCCESS)

Aug 30 11:47:32 www systemd[1]: Starting Nameserver information manager...
Aug 30 11:47:32 www systemd[1]: Started Nameserver information manager.
```

Success! DNS was back to normal and I was able to update and upgrade again as usual.

```
sudo reboot
sudo apt-get update
sudo full-upgrade
```
