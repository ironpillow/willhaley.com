---
layout: post
title: "Chinese Characters in Android Emulator"
date: 2013-10-21 21:13:00 -0500
comments: true
categories: 
---

In my experience, every Android emulator normally uses the Latin (and thereby English) IME for character input except the 3.x emulator.  I do not know if this varies by SDK version or by OS, but I have seen this emulator differs from the others in that the default input method, sometimes, is the Pinyin/Chinese character set.

I apologize for my ignorance in that I do not know exactly what Pinyin applies to, but a [a quick google search](https://en.wikipedia.org/wiki/Pinyin) seems to imply that it "is the official phonetic system for transcribing the sound of Chinese characters into Latin script..."

I have found that the easiest way to disable the PInyin IME is to do what user [sergeytch](http://stackoverflow.com/users/655318/sergeytch) describes in [this Stack Overflow article](http://stackoverflow.com/a/9126799).  This method is a bit brute force because it deletes the Pinyin IME entirely, but it does work.  When I've run into this issue, it seems there is no other easy way to disable Pinyin.

```
> adb shell
# mount -rw -o remount /dev/block/mtdblock0 /system
# rm /system/app/PinyinIME.apk
```

