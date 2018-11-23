---
title: "Music Organization"
date: 2018-11-21 10:55:00
published: false
---

This is my personal and opinionated approach to local music file organization.

If using a cloud service, this is all moot since there is really no need to download your audio files locally in the first place.

Most people needn't worry about music organization at all these days. As long as the tags on audio files are accurate, most applications can look at those tags and organize your audio for you. Almost any music service offering digital download today will properly tag your audio.

Even if using local audio files (including mp3 files from as far back as 1998 like me), most applications do not care about how audio files are organized. Most applications can rely on audio tags to organize everything appropriately.

[Kodi](https://kodi.wiki/view/Music_tagging) outright ignores the folder and path structure for music files.

> The music library is based on scanning tags embedded in the music files. It ignores the folder structure and file names you have created to store your music files. Basic and correct tagging is essential to ensure the library is populated correctly. Having slight variations in the tags for artist and album names could mean duplicated and unwanted entries.

[Plex](https://support.plex.tv/articles/200265296-adding-music-media-from-folders/) defers to tags like Kodi does, but Plex can and will fall back on folder structure if tags are not present.

> In the absence of embedded metadata in your tracks, the file naming and organization are both very important. You should name and organize the tracks as follows:
>
> * Music/ArtistName - AlbumName/TrackNumber - TrackName.ext

Though, Plex encourages organization for music even if it is tagged. In this case, it defers to the iTunes hierarchy. This also seems to matter if a user has a Plex Premium music library.

> In such a case, your file naming and organization isn’t as critical, though we do still certainly encourage you to be organized and consistent. For instance, the standard iTunes organization would be fine in this situation:
>
> * Music/ArtistName/AlbumName/TrackNumber - TrackName.ext

[Picard by MusicBrainz](https://picard.musicbrainz.org/) and [MP3Tag](https://www.mp3tag.de/en/) are applications that can be used to automatically query an online database to properly tag audio files. They can also tag files based on the path/file names or even update the file names based on the tags.

I prefer to manually organize my audio files in a scheme like so.

```
David Bowie/Space Oddity (1969)/1 Space Oddity.mp3
```

That naming handles the vast majority of audio files in my case, but there are exceptions. Some files do not belong to any album. In that case, I would use `Unknown Album`.

```
AristName/Unknown Album/TrackName.ext
```

And albums that were divided into multiple discs when released can be named with disc numbers.

```
Pink Floyd/The Wall (1979)/1-8 Empty Spaces.m4a
```

Things get a bit messier for compilations and soundtracks. For those I lump everything under the `Various Artists` directory. That naming helps consolidate all the tracks for a given album, fidelity is lost. We can tag every audio file with `Various Artists` as the artist, but we lose the knowledge over which artist performed on which track. Although that's less than ideal, I typically find myself looking up these sorts of albums by the context of the album name, and not the artist, so it does not matter much to me.

```
Various Artists/28 Days Later (2003)
```

Things get a bit weird when a foreward slash is part of a band name, like `AC/DC`. `/` is invalid in a lot of filesystems so that character cannot be in a file or directory name.

There is not a great answer here. Using something like `_` and translating to `/` in the tags can be confusing if `_` is already part of the artist, album, or track name, which is entirely possible. `\` could be used, if you don't mind that things look a little funky in the filename, but again, some artist, album, or track names way already legitimately be using `\` in their name.

Another option is to use a unicode character that _looks_ like the slash, but is actually different and so is legal in a filename.

```
⁄ ∕ ╱⧸
```

I prefer to use the third character in that set. `╱`, the `Box Drawings Light Diagonal Upper Right To Lower Left` character `U+2571`.

The reason I feel ok using that character is that it looks so distinct from the typical `/` that it is unlikely you will confuse the two in the terminal if running a command like `rm`. Indeed, using a "fake" slash seems very dangerous. Imagine you accidentally named a file with our unicode fake slash `╱`, then decided to delete it with `rm -rf ╱`. Better be careful with that one!

I feel safe using it since I will allow it to exist in my `~/Music` directory, but use this solution at your own risk!

At this point, it is relatively simple to use a library like [mutagen](https://pypi.org/project/mutagen/) to write a Python script that can automatically tag files as needed.