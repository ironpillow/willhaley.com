---
title: "Default Foreign Soft Subtitle Support In Plex Using HandBrake"
slug: default-foreign-soft-subtitle-support-in-plex-using-handbrake
date: 2016-08-20 21:24:51
disqus: true
---

After much trial and error, I discovered how to properly get subtitle support in Plex without needing to manually enable subtitles when viewing.

The process I am using specifically covers movies transcoded from DVDs, not BluRays.

I am using HandBrakeCLI, but you should be able to extrapolate the same process for use with the HandBrake GUI.

I want to stop and point out a few things:

1. This guide is for soft (non-burned in) subtitles.
1. This guide requires you to use `.mkv` files. These steps will *NOT* work for `.mp4` files, as highlighted below.
1. Since `.mp4` is the standard for Apple devices, you should consider your priorities before proceeding.

<!-- more -->

Before we dive in, we should discuss the different nuances of subtitles (as well as I understand them).

## Subtitles vs Closed Captions

Let us be clear that *subtitles* and *closed captions* are not the same. Closed captions encompass sound effects like `[Loud thud]` or `[Explosion in distance]`, in _addition to_ displaying dialogue.

Subtitles, in contrast, are only meant for displaying dialogue. Subtitles do not reflect sound effects or other audio that might be significant for a person unable to hear the audio.

What most people usually want for their videos in Plex are the subtitles. A classic example would be the alien dialogue in Star Wars: A New Hope. When Greedo, the alien, talks to Han Solo, Greedo speaks in a non-English alien language. That dialogue is significant, and we want to see it for the sake of understanding the scene.

## Hard vs Soft Subtitles

There are two ways to display subtitles. "Hard" vs "Soft" subtitles. Hard subtitles are "burned in" to a file. So if you transcoded a DVD, the subtitles would be part of the video. Soft subtitles are not permanently burned into the video. The information in soft subtitles is contained within a video file, and the subtitles are displayed by the media player as needed.

*This guide is going to focus on soft subtitles*. I prefer soft subtitles rather than burning them in to the video track with hard subtitles. That's just my preference.

## Subtitle Formats

There are different formats for subtitles, but the most common formats related to DVDs and HandBrake are SubRip (`.srt`) and VobSub (`.sub` with `.idx`)

_When using a DVD as the input, the subtitles will be VobSub_. It is important to note that *VobSub subtitles are _images_, NOT text*. What does that mean? Well, an `.srt` file is actually just a text file that looks like this.

```
410
00:47:36,000 --> 00:47:37,500
Going somewhere, Solo?

411
00:47:37,800 --> 00:47:42,000
Yes, Greedo. As a matter of fact, I was just going to
see your boss. Tell Jabba that I've got his money.

412
00:47:42,500 --> 00:47:46,500
It's too late. You should have paid him when
you had the chance.
```

As you can see, the file is plain text with time indexes and the text that should be displayed. Very simple! Unfortunately, this is *not* the format used for subtitles on DVDs. DVDs use VobSub, which is an image of the subtitles. That's right. Not text, but an actual image of the text.

Although SubRip (`.srt`) files seem superior, we are stuck with VobSub when transcoding DVDs.

Just in case you were wondering, "Can I somehow rip `.srt` files from my DVD? Or convert them somehow?", the short answer is, "No".

Because VobSub subtitles are images, there is no simple way to convert VobSub subtitles to SubRip subtitles without using OCR (Object Character Recognition) to try and scan the images and convert them to text. That process is _possible_, but it's not reliable and still requires you to manually check and make sure that OCR worked properly, and that the time codes are perfect.

It is possible to download SubRip (`.srt`) files from reputable sites, and then apply those to a video with HandBrake. These subtitles would most likely have been manually created by a dedicated person like yourself, but if you have a different edition or version of a film than what was used to create the `.srt`, then you will end up with a mismatched file requiring manual editing. `.srt` subtitles are great and a much nicer format, but, in my opinion, more trouble than they're worth when it comes to transcoding a DVD.

Even though VobSub subtitles are a bit of a clunky format (in my opinion), HandBrake is perfectly suited to add them to transcoded files. So let's get to it.

## MKV Files Are A Must

_*You MUST use `.mkv` files for any of this to work*_.

The reason is that we're going to rely on a feature in HandBrake called "default subtitles".

Simply put: *`.mkv` files support "default subtitles", but `.mp4` files do not.* [Default subtitle tracks will only be enabled on playback when using mkv files.](https://trac.handbrake.fr/wiki/Subtitles).

## Manually Selecting The Subtitle Track

So we know we must use VobSub subtitles, and we must use `.mkv` files. Perfect, but there's another trick to be aware of. DVDs often have multiple subtitle tracks, so how do we know which track we want?

Well, you could play a movie in VLC to verify which subtitle track is appropriate. You may even find that VLC magically selects the appropriate subtitle track.

![VLC default dvd subtitle track](/assets/default-foreign-soft-subtitle-support-in-plex-using-handbrake/Screen Shot 2016-08-21 at 10.09.34 PM.png)

Hey now, look at that! When playing this DVD in VLC, it defaults to track 2. It's an English language movie, and if I play the DVD to a spot where I know there's non-English dialogue, the subtitles are there as expected! Perfect!

According to the [CLI Guide](https://trac.handbrake.fr/wiki/CLIGuide) all we need to do in order to add subtitles to a video is to specify a subtitle track like `--subtitle 2` and we're good! That, with the use of `--subtitle-default`, will tell any video player which subtitle track in the video file it should default to. The combination of those two flags in HandBrake is what would allow you to get the alien language subtitled dialogue for a film like Star Wars.

## Automatically Selecting The Correct Subtitle Track

So now we just need to pass that information to HandBrakeCLI. But wait, this seems like a hassle if we wanted to get subtitles for every movie. Must we always hunt through each DVD to find the right subtitle track?

No! There's an even nicer format that can save us from hunting for the proper subtitle track.

Thankfully, HandBrake supports a special subtitle track called `scan`. If you pass `--subtitle scan`, HandBrake will search for subtitle tracks that appear "10 percent of the time or less".

As an example, subtitled dialogue like the alien languages in Star Wars, which is very brief compared to the native English dialogue, would automatically be detected by `scan` as that dialogue appears less than 10% of the time in the film.

Let's take advantage of that nifty feature to get a more robust command for `HandBrakeCLI`.

## Putting It All Together

This is the full command needed to get our proper subtitle support.

```
HandBrakeCLI \
	--native-language eng \
	--preset Normal \
	--subtitle scan \
	--subtitle-default=1 \
	--main-feature \
	--input '/dev/dvd' \
	--output 'Public Domain DVD.mkv'
```

In that example, `scan` is the `1`st track in the VobSub subtitles we're extracting from the DVD, that is why we have `--subtitle-default=1`.

`--subtitle-default` is the real magic here. The `.mkv` format understands that it should use that subtitle track by default and so will automatically play it in VLC, Plex, and other multimedia players as appropriate.

Give that command a run, and now if you play the output `.mkv` file in VLC, you should see subtitles working as expected.

## Plex Subtitles

That's great for VLC, but what about Plex?

It's actually rather simple. Configure Plex to respect our subtitles under the `Settings -> Languages` menu.

Check the "Automatically select audio and subtitle tracks" box, and change "Subtitle mode" to "Shown with foreign audio".

![Plex respect subtitles](/assets/default-foreign-soft-subtitle-support-in-plex-using-handbrake/plex-respect-subtitles.png)

With that in place, you should now be able to add your `.mkv` file to your library and see Plex respecting the subtitles where appropriate.

## Bonus

If you want *every* subtitle track (English, French, Spanish, etc.) *and* to have HandBrake default to the `scan`ned track, then do the following.

```
HandBrakeCLI \
	--native-language eng \
	--preset Normal \
	--subtitle scan,1,2,3,4,5,6,7,8,9,10 \
	--subtitle-default=1 \
	--main-feature \
	--input '/dev/dvd' \
	--output 'Public Domain DVD.mkv'
```

There is no way to specify "all" subtitle tracks. Instead, you can put in a long list like I did in this command. Although my source may not have 10 subtitle tracks, this will not cause any errors or issues.

Because `scan` is the first subtitle in the list, it is still specified as the default using `--subtitle-default=1`.
