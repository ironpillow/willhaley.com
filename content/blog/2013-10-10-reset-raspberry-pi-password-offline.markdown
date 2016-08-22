---
title: "Reset Raspberry Pi Password Offline"
slug: reset-raspberry-pi-password-offline
date: 2013-10-10 20:31:00
disqus: true
---

These instructions apply not just to a Raspberry Pi, but many Linux distributions.  If you forgot the password to your Pi, worry not, it's possible to reset it without re-installing.

1. Take the SD card out of your Pi and plug it into another computer with an SD card reader.
1. Open the SDCARD/etc/shadow file on your Raspberry Pi
1. Look down the list for your user name.  It should look like this.

    ```
    pi:$6$R0iLJW7j$1eWDasdXcPQv2dQv5xcUnDew/VU/pur0ZbMi8RgdsaLtd6uzCyMuvZK7r9ZVmo0:15871:0:99999:7:::
    ```
1. Delete everything between the first and second colon (:)
1. Save the shadow file.
1. You just blanked out your password.  Plug the SD card back into your Pi and boot up.
1. You should now be able to sign in using a blank password.
