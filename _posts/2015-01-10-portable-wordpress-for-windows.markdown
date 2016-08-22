---
layout: post
title: "portable WordPress for Windows"
date: 2015-01-10 13:39:44 -0600
comments: true
categories: 
---

I occasionally teach computer classes at a local community center and one of our classes covers basic WordPress and web design.

One of our goals in the first iteration of this class was to have students interact with a full WordPress installation.  However, we did not want to pay for web hosting or set up a server in-house that the students could connect to.  Primarily, the effort of administrating the WordPress instances and user accounts did not seem worthwhile.

<!-- more -->

We did not want the hassle of IIS and the local Microsoft web stack, and even a virtual machine with linux felt beyond the scope of our class.

This is an introductory class, and although basic web administration is important, we have a limited time for this class and we wanted to focus on WordPress.

After a bit of searching I stumbled onto [Instant WordPress](http://www.instantwp.com/).

This is what we ended up using.  It's free, light, and very easy.  This allowed us to get a portable standalone version of WordPress running on Windows.

It has persistence so changes you make are preserved.  You can run it from a flash drive or network drive.  It's a collection of static files that does not require any installation on your local machine.  Just copy and run.

It comes with some default settings, but it's close to a vanilla installation of WordPress.  Uncompressed it's a little over 200MB.

This was a huge aid in getting our students introduced to WordPress.  We could show them the WordPress folder structure, get into the basics of WordPress, and we didn't need to pay for web hosting or worry about managing usernames and passwords.

Every student was using a local instance on each of their own machines and they were all using the same default credentials.  All we had to do was point them to `http://127.0.0.1/wordpress` and they were ready to go.