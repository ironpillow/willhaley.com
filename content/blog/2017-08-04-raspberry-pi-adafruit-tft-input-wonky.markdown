---
title: "Correcting Wonky TFT Input Events on Raspberry Pi with Adafruit TFT"
slug: raspberry-pi-adafruit-tft-input-wonky
date: 2017-08-04 00:00:00
archived: true
---

I had an interesting issue with my [Adafruit PiTFT 2.8" Touchscreen Display for Raspberry Pi](https://learn.adafruit.com/adafruit-pitft-28-inch-resistive-touchscreen-display-raspberry-pi/easy-install).

The screen was displaying properly, and touch events were received, but those events seemed to be misinterpreted resulting in strange behavior and an inability to actually use the touch interface.

I thought the axes were swapped or inverted somehow, but some careful examination eventually revealed the underlying issue.

In my case, all events were being misinterpreted like so.

```
drag up    => drag left
drag right => drag up
drag down  => drag right
drag left  => drag down
```

A better way to picture that may be like a map compass. This is how my inputs looked.

```
    right
up        down
    left
```

If you rotate that compass 90 degrees clockwise (tilt your your head and look at it sideways), the orientation is correct.

That is the root problem. All the touch events are being rotated from their normal position. Every event is 90 degrees counterclockwise from where it should be.

You can correct this by adding a `TransformationMatrix` to one of the X config files provided with the Adafruit Jessie Raspberry Pi image.

Update `/etc/X11/xorg.conf.d/99-calibration.conf` and add the following line.

```
Option "TransformationMatrix" "0 -1 1 1 0 0 0 0 1"
```

That line results in a 90 degree clockwise transformation. Reboot, and the changes should take affect.

You can find [examples of other transformations on the Ubuntu wiki](https://wiki.ubuntu.com/X/InputCoordinateTransformation).

# Citations

* [TFT LCD 3.5 display with inverted axis](https://raspberrypi.stackexchange.com/questions/61053/tft-lcd-3-5-display-with-inverted-axis)
* [InputCoordinateTransformation](https://wiki.ubuntu.com/X/InputCoordinateTransformation)
