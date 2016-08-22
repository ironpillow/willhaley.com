---
title: "iperf3 Server and Client"
slug: iperf3-server-client
date: 2017-08-16 00:00:00
---

`iperf3` is useful for testing the network throughput of your local network. It can help to indicate network bandwidth of individual nodes on your LAN. Do you have one computer that seems perpetually slow? Then `iperf3` may be able to confirm this potential issue.

A WAN speedtest service like [Google's](http://speedtest.googlefiber.net/) will not necessarily indicate the speed of individual nodes on your LAN. Rather, it is better suited to testing the throughput from your home to the public Internet.

<!-- more -->

Install `iperf3` on both the server and client. On Ubuntu you may need to [enable the universe repository](https://askubuntu.com/questions/148638/how-do-i-enable-the-universe-repository).

```
sudo apt-get install iperf3
```

<span class="warning">Run these commands on your iperf3 **server**.</span>

Create a service at `/etc/systemd/system/iperf3.service` that will run the server.

```
[Unit]
Description=iperf3

[Service]
ExecStart=/usr/bin/iperf3 --server

[Install]
WantedBy=multi-user.target
```

Enable the service.

```
sudo systemctl enable iperf3
```

Start the service.

```
sudo systemctl start iperf3
```

Verify that the service is running.

```
sudo systemctl status iperf3
```

Note the IP address of the server.

```
ip addr
```

<span class="warning">Run these commands on the **client** to test network throughput.</span>

Note, you must replace the IP address below with the IP address of **your** `iperf3` server.

Client download test.

```
iperf3 \
	--reverse \
	--format m \
	--version4 \
	--client 192.168.1.143
```

Client upload test.

```
iperf3 \
	--format m \
	--version4 \
	--client 192.168.1.143
```

# Citations

* [BUILD AN IPERF3 SERVER ON UBUNTU SERVER 14.04](https://thatservernerd.com/2016/05/27/build-an-iperf3-server-on-ubuntu-server-14-04/)
