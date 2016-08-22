---
title: "Creating The EncFS Extension For TinyCore Linux"
slug: creating-the-encfs-extension-for-tinycore-linux
date: 2015-09-16 21:19:56
---

Creating an extension for TinyCore Linux is fairly straightforward [thanks to their documentation](http://wiki.tinycorelinux.net/wiki:creating_extensions).

Below is a simple bash script I used to help me automate the process when I was building the EncFS extension for TC. Note, I am *not* the author of EncFS. I only compiled a build and packaged it for TinyCore Linux.

There are some major steps in the build process missing here, but you may find some helpful pointers. The documentation I linked to above from TinyCore is the best source of truth when it comes to the packaging process.

<!-- more -->

	#!/bin/sh

	# Required extensions to build (and to package and submit)
	tce-load -wi submitqc6 git coreutils squashfs-tools automake gettext m4 pkg-config libtool-dev sed glibc_base-dev gcc linux-3.16.2_api_headers fuse openssl-1.0.1-dev rlog rlog-dev make boost-dev

	# Notes: -fno-exceptions -fno-rtti caused compilation errors. Do not use.

	# **build**

	cd /tmp && git clone https://github.com/vgough/encfs && cd encfs

	autoreconf -if

	export CFLAGS="-march=i486 -mtune=i686 -Os -pipe"
	export CXXFLAGS="-march=i486 -mtune=i686 -Os -pipe"
	export LDFLAGS="-Wl,-O1"

	./configure --prefix=/usr/local

	touch /tmp/mark

	make -j3

	make DESTDIR=/tmp/package install-strip

	# **package**

	PACKAGE=encfs

	mkdir -p /tmp/package/usr/local/share/doc/$PACKAGE
	cp -f /tmp/encfs/COPYING* /tmp/package/usr/local/share/doc/$PACKAGE

	(cd /tmp && mksquashfs package $PACKAGE.tcz)

	(cd /tmp/package && find usr -not -type d > /tmp/$PACKAGE.tcz.list)

	rm -f /tmp/$PACKAGE.tcz.dep

	for dep in "openssl-1.0.1" "rlog" "boost" "fuse"
	do
	  echo "$dep.tcz" >> /tmp/$PACKAGE.tcz.dep
	done

	(cd /tmp && md5sum $PACKAGE.tcz > $PACKAGE.tcz.md5.txt)


Do this *after* the .tcz.info file is available to properly audit your build.

	(cd /tmp && submitqc6)
