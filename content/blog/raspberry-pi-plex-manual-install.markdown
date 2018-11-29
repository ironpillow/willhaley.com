---
title: "Manually Install Plex Media Server on Raspberry Pi 3"
date: 2018-11-28 19:31:00
---

At time of writing this article, most of the guides I've found concerning the installation of Plex on a Raspberry Pi recommend using the Raspberry Pi compatible Raspbian/Debian package offered by [dev2day](https://dev2day.de/plex-media-server-arm/). The work by dev2day provides a simple and easy way to install the Plex server on a Raspberry Pi.

**I recommend using the `dev2day` package repository and instructions for a pain-free installation process. My process, written below, is manual and untested.**

Despite that warning, if you're like me and hate ever adding third party repositories to your machine, you can manually install Plex on a Raspberry Pi 3 using the instructions below. All the steps below are based entirely on [dev2day's work](https://github.com/uglymagoo/plexmediaserver-installer).

Download the `Synology` package for `ARMv7` from the Plex [Media Server Downloads](https://www.plex.tv/media-server-downloads/) page to your Raspberry Pi. You can `curl` the download URL on your Pi like so.

```
curl \
    -o plex.tar \
    "https://downloads.plex.tv/plex-media-server/1.14.0.5470-9d51fdfaa/PlexMediaServer-1.14.0.5470-9d51fdfaa-arm7.spk"
```

Create a destination directory for the Plex server files.

```
sudo mkdir -p /usr/lib/plexmediaserver
```

The `plex.tar` archive is a Synology package, and the file structure inside `plex.tar` looks like this.

```
INFO  PACKAGE_ICON.PNG  package.tgz  plex.tar  scripts  syno_signature.asc
```

What we want is the `package.tgz` file. We can extract it directly to our desintation directory using this command which will run as root.

```
sudo su -c 'tar -xOf plex.tar package.tgz | tar -xzf - -C /usr/lib/plexmediaserver'
```

Create a config file at `/etc/default/plexmediaserver` like so. Note that these are all the defaults as of time of writing.

```
# /etc/default/plexmediaserver

# the number of plugins that can run at the same time
PLEX_MEDIA_SERVER_MAX_PLUGIN_PROCS=6

# ulimit -s $PLEX_MEDIA_SERVER_MAX_STACK_SIZE
PLEX_MEDIA_SERVER_MAX_STACK_SIZE=3000

# where the mediaserver should store the transcodes
PLEX_MEDIA_SERVER_TMPDIR=/tmp

# uncomment to set it to something else
# PLEX_MEDIA_SERVER_APPLICATION_SUPPORT_DIR="${HOME}/Library/Application\ Support"

# the user that PMS should run as, defaults to 'plex'
# note that if you change this you might need to move
# the Application Support directory to not lose your
# media library
PLEX_MEDIA_SERVER_USER=plex
```

Create a `plex` user, which will be used for running the Plex Media Server (PMS) process.

```
sudo adduser \
    --quiet \
    --system \
    --shell /bin/bash \
    --home /var/lib/plexmediaserver \
    --group plex
```

Add the `plex` user to the `video` group.

```
sudo gpasswd -a plex video
```

Create a `systemd` service control file at `/lib/systemd/system/plexmediaserver.service` like so.

```
[Unit]
Description=Plex Media Server for Linux
After=network-online.target

[Service]
Environment="PLEX_MEDIA_SERVER_APPLICATION_SUPPORT_DIR=/var/lib/plexmediaserver/Library/Application Support"
Environment=PLEX_MEDIA_SERVER_HOME=/usr/lib/plexmediaserver
Environment=PLEX_MEDIA_SERVER_MAX_PLUGIN_PROCS=6
Environment=PLEX_MEDIA_SERVER_TMPDIR=/tmp
ExecStartPre=/bin/sh -c '/usr/bin/test -d "${PLEX_MEDIA_SERVER_APPLICATION_SUPPORT_DIR}" || /bin/mkdir -p "${PLEX_MEDIA_SERVER_APPLICATION_SUPPORT_DIR}"'
ExecStart=/bin/sh -c 'LD_LIBRARY_PATH=/usr/lib/plexmediaserver "/usr/lib/plexmediaserver/Plex Media Server"'
Type=simple
User=plex
Group=plex
Restart=on-failure
RestartSec=5
StartLimitInterval=60s
StartLimitBurst=3

[Install]
WantedBy=multi-user.target
```

Start the `plexmediaserver` service.

```
sudo systemctl start plexmediaserver
```

Enable the `plexmediaserver` service at boot.

```
sudo systemctl enable plexmediaserver
```

Navigate to the IP address of your Pi in a web browser to start using Plex. The URL should look something like this. Note, it may take a few seconds before Plex starts and this link works.

```
http://192.168.1.101:32400/web/
```