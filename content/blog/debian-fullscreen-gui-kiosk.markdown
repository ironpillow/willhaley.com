---
title: "Debian Fullscreen GUI Kiosk"
date: 2017-08-03 00:00:00
date_modified: 2018-05-15 20:32:00
disqus: true
---

These instructions are helpful if you would like to create a computer kiosk. The instructions are designed to run Chromium (the open-source version of Google's Chrome browser), but can be adapted to run any GUI program in a kiosk/fullscreen mode.

This guide was last tested against Debian 9.4 (Stretch) GNU/Linux.

**Note that this guide is not intended to create a perfectly secure system, and may be vulnerable to tampering by knowledgable users.**

Create a user on the system for the kiosk. In my case, the user is named `kiosk-user`.

```
useradd -m kiosk-user
```


Update the package list.

```
apt-get update
```

Install required packages.

```
apt-get install \
    sudo \
    xorg \
    chromium \
    openbox \
    lightdm
```

Edit the lightdm config script at `/etc/lightdm/lightdm.conf` to enable autologin.

That file needs to only contain this content for autologin to work.

```
[SeatDefaults]
autologin-user=kiosk-user
user-session=openbox
```

Reboot to verify autologin works. You should now be logged in as `kiosk-user` automatically.

Create the openbox config directory for `kiosk-user` if it does not exist.

```
mkdir -p $HOME/.config/openbox
```

Create a script at `$HOME/.config/openbox/autostart` for the `kiosk-user`. This script will be run at login.

```
chromium \
    --no-first-run \
    --disable \
    --disable-translate \
    --disable-infobars \
    --disable-suggestions-service \
    --disable-save-password-bubble \
    --start-maximized \
    --kiosk "http://www.google.com" &
```

The `&` at the end is required for _every_ command in the `autostart` script.

Reboot, and you should see the machine automatically login and run chromium in kiosk mode.

# Citations

* [How to open Chromium in full screen kiosk mode in minimal windows manager environment (like openbox / jwm)](https://askubuntu.com/questions/487488/how-to-open-chromium-in-full-screen-kiosk-mode-in-minimal-windows-manager-enviro).
* [Building a kiosk computer with Chrome](http://matthieukeller.com/2016/12/building-a-kiosk-computer-with-chrome.html)
* [How to fix "X: user not authorized to run the X server, aborting."?](http://karuppuswamy.com/wordpress/2010/09/26/how-to-fix-x-user-not-authorized-to-run-the-x-server-aborting/)
* [Ubuntu 14.04, dpkg-reconfigure select option unattended](https://askubuntu.com/questions/629046/ubuntu-14-04-dpkg-reconfigure-select-option-unattended)
* [Help:Autostart](http://openbox.org/wiki/Help:Autostart)
