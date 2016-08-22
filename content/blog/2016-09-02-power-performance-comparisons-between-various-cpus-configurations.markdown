---
title: "Power and Performance Comparisons Between Various CPUs and Configurations"
slug: power-performance-comparisons-between-various-cpus-configurations
date: 2016-09-02 17:28:48
---

I have several computers sitting around my home in various states of completion. Some are used daily, some are just a few components plugged together sitting on a shelf.

A long-running hobby of mine has been setting up a reliable home theater for my digital media. I bounced around between various providers before finally landing with Plex.

For me, the great appeal behind Plex is that I can have a headless server running off in a closet and use the Plex client app on my Roku. One device. One remote. No loud PC sitting in my living room. Simple.

The question for me came to figuring out which of my computers and components would make the best long-running server. I wanted to find which configuration of mine would draw the least electricity while providing reasonable times to transcode media with HandBrake as needed.

To that end, I ran a bunch of rudimentary experiments to try and measure and balance these qualities.

I was looking for:

* Low power usage.
* Short HandBrake transcode time.
* Ability to run Plex server (this point became moot. All configurations handled this perfectly).

I would have _loved_ to use a Raspberry Pi, but I found it was under-powered for this job.

The results were surprising at some points, and gave me interesting insights into which of my components are most efficient or the biggest energy hogs.

# Processors tested

I tested various configuraitons against these three LGA 775 processors.

<!-- more -->

* Intel Core 2 Extreme QX6700 Quad-Core Processor.
* Intel Core 2 Duo E6600 Dual-Core Processor.
* Intel Celeron 430 Processor.

| CPU    | Cores | Speed |
| ------ | ----- | ----- |
| QX6700 | 4     | high  |
| E6600  | 2     | med   |
| 430    | 1     | slow  |

# Hypothesis

I tested each CPU transcoding the same file in HandBrake, and tested to see if the various configurations of components were able to handle the same Plex docker instance.

This isn't very scientific in that not all CPUs were tested in the exact same rigs with the exact same conditions, but I was at least able to find patterns and trends. Some configurations were tested more extensively than others.

# Experiments

Wattage was measured using a Kill-A-Watt. Wattage was measured while the rig was "idle" (booted for several minutes. No user-based activity) and while under load doing a HandBrake job. In most cases, I re-ran the HandBrake job multiple times to get an average, but the times seem fairly consistent overall.

Time is measured in minutes:seconds.

## Quad-Core with NVIDIA GPU

I figured this would be my most power-hungry configuration. The most peripherals, everything turned up to 11, etc.

* Intel Core 2 Extreme QX6700 Quad-Core Processor.
* 5 spindle disks.
* Fans at "high".
* BOXD975XBX2KR motherboard with 8GB RAM.
  * No onboard video.
* NVIDIA GPU.
* Corsair HX620W.

133 watts while idle.

| Run | Wattage Under Load | Time To Transcode |
| --- | ------------------ | ----------------- |
| 1   | 210                | 5:25              |
| 2   | 210                | 5:23              |
| 3   | 210                | 5:24              |

## Same as previous, but removed the NVIDIA GPU

* Intel Core 2 Extreme QX6700 Quad-Core Processor.
* All 5 spindle disks.
* Fans at "high".
* BOXD975XBX2KR motherboard with 8GB RAM.
  * No onboard video.
* Corsair HX620W.

110 watts while idle.

| Run | Wattage Under Load | Time To Transcode |
| --- | ------------------ | ----------------- |
| 1   | 140                | 19:35             |
| 2   | 140                | 19:31             |

## Same as previous, but non-essential spindle disks were disconnected

* Intel Core 2 Extreme QX6700 Quad-Core Processor.
* 1 spindle disk (3TB).
* Fans at "high".
* BOXD975XBX2KR motherboard with 8GB RAM.
  * No onboard video.
* Corsair HX620W.

87 watts while idle.

| Run | Wattage Under Load | Time To Transcode |
| --- | ------------------ | ----------------- |
| 1   | 116                | 19:34             |

## Core 2 Duo with BOXD945GCNL motherboard

* Intel Core 2 Duo E6600 Dual-Core Processor.
* 1 spindle disk (3TB).
* Fans at "low".
* BOXD945GCNL motherboard with 2GB RAM.
  * Integrated Intel GPU
* Corsair HX620W.

58 watts while idle.

| Run | Wattage Under Load | Time To Transcode |
| --- | ------------------ | ----------------- |
| 1   | 100                | 11:36             |
| 2   | 100                | 11:33             |
| 3   | 100                | 11:35             |

## Core 2 Duo with BOXD975XBX2KR motherboard

* Intel Core 2 Duo E6600 Dual-Core Processor.
* 1 spindle disk (3TB).
* Fans at "low".
* BOXD975XBX2KR motherboard with 8GB RAM.
  * No onboard video.
* Corsair HX620W.

72 watts while idle.

| Run | Wattage Under Load | Time To Transcode |
| --- | ------------------ | ----------------- |
| 1   | 98                 | 21:36             |
| 2   | 96                 | 21:37             |

## Same as previous, but with only 2GB of RAM

* Intel Core 2 Duo E6600 Dual-Core Processor.
* 1 spindle disk (3TB).
* Fans at "low".
* BOXD975XBX2KR motherboard with 2GB RAM.
  * No onboard video.
* Corsair HX620W.

66 watts while idle.

| Run | Wattage Under Load | Time To Transcode |
| --- | ------------------ | ----------------- |
| 1   | 90                 | 21:47             |

## Same as previous, with NVIDIA GPU

* Intel Core 2 Duo E6600 Dual-Core Processor.
* 1 spindle disk (3TB).
* Fans at "low".
* BOXD975XBX2KR motherboard with 2GB RAM.
  * No onboard video.
* Corsair HX620W.
* NVIDIA GPU.

89 watts while idle.

| Run | Wattage Under Load | Time To Transcode |
| --- | ------------------ | ----------------- |
| 1   | 128                | 11:31             |
| 2   | 127                | 11:33             |

## Same as pervious, but back to 8GB of RAM

* Intel Core 2 Duo E6600 Dual-Core Processor.
* 1 spindle disk (3TB).
* Fans at "low".
* BOXD975XBX2KR motherboard with 8GB RAM.
  * No onboard video.
* Corsair HX620W.
* NVIDIA GPU.

97 watts while idle.

| Run | Wattage Under Load | Time To Transcode |
| --- | ------------------ | ----------------- |
| 1   | 136                | 11:25             |
| 2   | 136                | 11:21             |
| 3   | 135                | 11:20             |

## Celeron

I didn't even bother transcoding with HandBrake with this rig. I was fairly certain it would be disappointing based on other results. Though, I did measure idle wattage, as I expected significant power savings.

* Intel Celeron 430 Processor.
* 1 spindle disk (3TB).
* Fans at "low".
* BOXD945GCNL motherboard with 2GB RAM.
  * Integrated Intel GPU

50 watts while idle.

# Observations

The most fascinating data to me was the *drastic* increase (~3x) time to transcode when the NVIDIA GPU was removed from the Quad-Core non-integrated graphics rig.

The Core 2 Duo transcoded almost 2x as fast with its integrated graphics as the Quad-Core with no graphics.

I did not realize how much work the NVIDIA GPU was doing in HandBrake.

I also did not realize how much power the NVIDIA GPU (albeit, it's almost 10 years old now) was drawing. 70 watts under load! That's more than the _entire_ wattage of some of the power thrify configurations when idle.

My hypothesis was correct that the most power-hungry rig was the most powerful.

Unfortunately, no configuration dropped under double-digit minutes for transcoding except the aforementioned hog, but the Core 2 Duo performed reasonably well with _significant_ power savings.

I found that every rig handled Plex fine. My HandBrake settings create videos that require no transcoding from Plex, so this wasn't a very revealing test for Plex performance, but it simulates my real-world usage so I'm happy. Plex usage barely added any energy draw.

The Core 2 Duo drew almost 20 fewer watts and was ~2x as fast when it was in a motherboard with onboard/integrated video.

I was pleased to find some concrete numbers around which components drew how much power.

All power savings are approximate.

| Wattage Savings | Cause                                |
| --------------- | ------------------------------------ |
| 33              | 4 non-essential spindle disks        |
| 8               | 6GB of RAM                           |
| 23              | NVIDIA GPU (when idle)               |
| 14              | BOXD945GCNL instead of BOXD975XBX2KR |

It's interesting to see the real-world implications of using different components.

The changes in RAM seemed to have no significant impact on transcoding time, though they did impact wattage.

Idle -> load is a 30 watt jump without the NVIDIA GPU.

Idle -> load is a 77 watt jump with the NVIDIA GPU.

This isn't reflected in the data above, but I saw ~6 watt drop when turning down my manually adjustable fans from high to low.

The NVIDIA GPU was a GeForce 8600 GT 64 bit with 33MHz clock. The board that had integrated Intel graphics was a 82945G/GZ 32 bit with 33 MHz clock (i915).

Even with the NVIDIA GPU, the Core 2 was almost twice as slow as the Quad Core with the NVIDIA GPU, so the CPU does factor into overall performance. This is even more clear when comparing transcode times when there is no GPU. It all comes down to CPU ability at that point.

The integrated Intel GPU on the BOXD945GCNL motheboard with the Core 2 Duo transcoded just as fast as the NVIDIA GPU on the BOXD975XBX2KR with the Core 2 Duo, but with a power savings of 30 watts.

# A modern configuration

I threw this in as a lark, but in hindsight, it has me questioning my entire presumption that I should use old hardware to try to save electricity.

I tested the same experiments against a much more modern Core i5 and GTX 960. The results were not surprising in some regards.

* Intel Core i5.
* 1 spindle disk (3TB).
* ITX MOBO with 16 GB RAM.
* GeForce GTX 960

42 watts while idle.

| Run | Wattage Under Load | Time To Transcode |
| --- | ------------------ | ----------------- |
| 1   | 83                 | 2:48              |
| 2   | 85                 | 2:39              |

This does not seem like a shock to me. Fastest CPU I have with the fastest GPU. What's wonderful is that it's fast *and* the lowest Wattage.

# Conclusion

Energy efficiency has come a long way over the past decade or so. I don't fault the older tech for taking as much energy as it does. Rather, I'm impressed at how much better things are now.

A GPU makes an incredible impact on HandBrake performance. I did not realize how heavily GPU acceleration factored into HandBrake's performance, but clearly, it is significant.

I could save about 45 watts and get similar performance by switching to the BOXD945GCNL motherboard, which has integrated graphics that perform almost just as well as the NVIDIA GPU.

The key for me now is finding the balance. This rig will be on frequently, and only rarely transcoding. So is the better setup one that consumes less power, but is slower? If it takes a day to transcode something that would take the other rig a few minutes, is there really a major savings?

I think it depends a lot on how often this is powered on in reality, and how much transcoding is done.

It seems that there are some clear energy savings if I switch over to the lower wattage motherboard and rely on the Intel onboard graphics.

Though, I should seriously consider if something like a Core i3 is actually best for the environment since I'd see both an increase in speed and much more efficient power consumption. Maybe all my old configurations are bound for [FreeGeek](http://freegeekchicago.org/) while I get some modern, more efficient, hardware.

Food for thought.
