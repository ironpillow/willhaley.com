---
title: "Cannot Ping Other Computer on DD-WRT Network"
slug: cannot-ping-dd-wrt
date: 2017-05-27 10:00:00
---

I recently ran into a problem where I was not able to ping, SSH, or otherwise connect to a computer on my home network. My router is using DD-WRT. Both machines were wired in.

[This](http://svn.dd-wrt.com/ticket/3736) [seems](https://superuser.com/questions/642517/dd-wrt-cannot-see-client-when-using-wired-ethernet) to be a [common](https://www.dd-wrt.com/phpBB2/viewtopic.php?p=492564&sid=96252734a48b2f17d915f7d98c07d250) [issue](https://www.dd-wrt.com/phpBB2/viewtopic.php?p=693021)

In the DD-WRT admin page navigate to `Administration` -> `Commands`.

Enter these commands (both lines at once) and click `Run Commands`.

```
swconfig dev eth1 set enable_vlan 1
swconfig dev eth1 set apply
```

This _should_ fix the problem immediately.

Occasionally, I encounter an error when running these commands. I do not understand why.

To troubleshoot this. I will do the following (not necessarily in this order, and often, multiple times).

* Run the commands one at a time.
* Switch `eth1` for `eth0`.
* Wait a while.
* Run both commands at the same time again.

Eventually, the commands run successfully.
