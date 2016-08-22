---
layout: post
title: "Power Consumption Tests With a Kill A Watt"
date: 2016-08-19 16:08:15 -0500
comments: true
categories: 
---

Saving electricity is great for the environment and my utility bill.

I recently ran some simple experiments to try and figure out which of my computers I'm better off using as a semi-permanent Plex server. My requirements are:

1. Power to transcode
2. Low drain on electricity

<!-- more -->

Ideally, I would use a Raspberry Pi, as it has low power requirements and is very cheap. Unfortunately, it's not powerful enough for my needs.

I used a [Kill A Watt](http://www.p3international.com/products/p4400.html) to crudely measure power consumption between a 100W TDP Core 2 Quad Extreme, and my much more modern 4th generation 65W TDP i5-4570S.

There are a lot of variables here that I was too lazy to normalize. Such as:

1. PSU
2. Motherboard
3. RAM
4. Peripherals

What I cared most about was net usage in watts between two existing builds, so that's what I focused on.

Not suprisingly, the older and higher [TDP](https://en.wikipedia.org/wiki/Thermal_design_power) CPU was much more of an electricity hog.

With no spindle drives connected to my Core 2 Quad, after boot, idle wattage was `100 watts`. With all 7 drives connected and powered to the same rig, idle usage was `130 watts`.

Clearly those disks add a lot of consumption, which makes me think I should go to fewer larger disks rather than multiple small capacity disks.

Despite the added wattage from the disks, the Core i5 is the clear winner at an idle wattage draw of `36 watts`. Not only is the idle consumption much lower, but the processor is much more powerful.

As much as I like having the old Core 2 Quad workhorse around, I am not so comfortable knowing how much electricity it's going to use when idle. Good to know. I don't take this as a knock on the Core 2 Quad, but rather an impressive measure of how much more efficient modern processors are.

