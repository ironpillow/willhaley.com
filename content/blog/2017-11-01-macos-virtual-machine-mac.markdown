---
title: "Installing macOS High Sierra In Parallels Lite On A Mac"
slug: macos-virtual-machine-mac
date: 2017-11-01 23:14:00
disqus: true
---

I wanted to install macOS High Sierra on a virtual machine on my Mac so that I could debug some issues. The host machine is running macOS and the guest VM would be running macOS as well.

VirtualBox does not support [APFS](https://en.wikipedia.org/wiki/Apple_File_System) right now and neither does Parallels Lite. This is a problem since APFS is the default for macOS High Sierra.

Although it _should_ be possible to install macOS High Sierra in VirtualBox on an HFS+ disk, I could not get it to work with VirtualBox. However, I _was_ able to get it working with [Parallels Desktop Lite](https://itunes.apple.com/us/app/parallels-desktop-lite/id1085114709?mt=12) (after a couple workarounds).

_I am assuming you are comfortable working with the command line, and already have a [High Sierra installer](https://itunes.apple.com/us/app/macos-high-sierra/id1246284741?mt=12&l=en-us&ls=1) available to you and downloaded on your Mac._

First, generate an `.iso` file from the High Sierra installer (thanks to some [helpful](https://gist.github.com/agentsim/00cc38c693e7d0e1b36a2080870d955b#gistcomment-2136321) [guides](https://tylermade.net/2017/10/05/how-to-create-a-bootable-iso-image-of-macos-10-13-high-sierra-installer/) for showing me how to do this).

Run each of these commands one after another. If something goes wrong, you can reboot to clear things out and try again.

```
hdiutil create \
	-o /tmp/HighSierra.cdr \
	-size 7316m \
	-layout SPUD \
	-fs HFS+J
```

```
hdiutil attach \
	/tmp/HighSierra.cdr.dmg \
	-noverify \
	-mountpoint /Volumes/install_build
```

```
sudo /Applications/Install\ macOS\ High\ Sierra.app/Contents/Resources/createinstallmedia \
	--volume /Volumes/install_build \
	--applicationpath /Applications/Install\ macOS\ High\ Sierra.app \
	--nointeraction
```

```
hdiutil detach \
	"/Volumes/Install macOS High Sierra"
```

```
hdiutil convert \
	/tmp/HighSierra.cdr.dmg \
	-format UDTO \
	-o /tmp/HighSierra.iso
```

```
mv /tmp/HighSierra.iso.cdr ~/Desktop/HighSierra.iso
```

```
rm /tmp/HighSierra.cdr.dmg
```

Install the Parallels Lite App from the App Store. [Follow the wizard](https://www.howtogeek.com/304866/how-to-make-linux-and-macos-virtual-machines-for-free-with-parallels-lite/) to create a new virtual machine. Choose to **"Install Windows or another OS from a DVD or image file"**.

Click **"Locate Manually"** to manually select our `HighSierra.iso` file.

You may see a warning saying **"Unable to detect operating system"**. That is ok.

Click **"Continue"** and select **"macOS"** as the operating system.

The virtual machine should then boot to the installation iso.

Launch `Terminal` from the `Utilities` menu.

Format the virtual machine hard drive as `HFS+` using the terminal.

```
diskutil eraseDisk HFS+J MacHD disk0
```

Reboot the VM and it should boot to the installation iso again. Rebooting may be overkill, but I do it to ensure that the install iso is properly detecting the disk and partition layouts after the erase we just performed.

Again, launch `Terminal` from the `Utilities` menu.

We will use a [special installer command](http://osxdaily.com/2017/10/17/how-skip-apfs-macos-high-sierra/) called `startosinstall`, and manually run the installer from the iso rather than using the GUI.

The only flags needed are `--converttoapfs NO` to prevent converting the disk to APFS, and `--volume /Volumes/MacHD` to specify our target installation volume.

```
/Volumes/Image\ Volume/Install\ macOS\ High\ Sierra.app/Contents/Resources/startosinstall \
	--converttoapfs NO \
	--volume /Volumes/MacHD
```
