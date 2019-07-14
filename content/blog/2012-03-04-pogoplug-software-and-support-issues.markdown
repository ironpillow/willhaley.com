---
title: "PogoPlug Software and Support Issues"
slug: pogoplug-software-and-support-issues
date: 2012-03-04 23:32:00
disqus: true
---

My family has a lot of old slides and photos.  We bought my father a scanner for Christmas 2010 so he could scan those memories onto our family laptop.  To date, my father has scanned in over 40 years worth of photos.

I knew I had to implement a backup solution for the photos, but I did not want a Desktop PC powered on 24 hours a day to act as a backup server.  I also did not want my dad to have to burn a CD every time he wanted to share photos, and I did not want to pay to for an online service to host this large number of photos.

I researched for several months, and although the web interface looked a little weak, the PogoPlug seemed like the best balance of free software and low wattage hardware that would do what I needed.  So I went to Best Buy, put down $100, and went home to set it up.

At first, everything was going great, but a year and a half and several major software revisions and support cases later, I can say with confidence that** I would never recommend a PogoPlug (Cloud Engines) product or service to anyone**.

<!-- more -->

The primary reason is because I keep having to deal with frequent** radical software updates with no user notifications or warnings**.  I feel like the service is unreliable, and I have to jump through hoops to get it to do the simplest things.

**Version 2**

I started with **version 2.5.5**.  It was simple.  The Web Ui allowed you to configure some very straight-forward settings, and to specify which folders to backup to your PogoPlug using **Active Copy**.  That is exactly why I bought the device.  Simple and clean.  I staged the backups to my PogoPlug, and as a bonus, I can share my photos with family and friends!  Hooray!

![2.5.51.png](/assets/pogoplug-software-and-support-issues/2.5.51.png)

**Then the problems began**.  Every couple of weeks my parents would call to tell me the Desktop software had become logged out despite us clicking "Remember Me" at the login page.  I thought that was odd, and eventually filed a support case.  A tech told me, in a poorly written response, that this was by design for security.

The following is from the email I got from support, verbatim.

<!-- Ticket #34940, -->
> Our engineers have informed that Pogoplug software logs out the user every two week this is by design for the user's security.
>
> Is this maybe a feature that will be reviewed and changed in the future but at this moment in time I have no time frame.

This design choice frustrates me very much. I can't just set and forget this device. I need to babysit it and re-login every two weeks to make sure my backups run properly.

How does the software logging out automatically make us any more secure?  There's an option online to unregister devices and we could always change our password.  Is that not enough security?  I saw this as an annoyance and a bug, not an enhancement.

**Version 3**

When you setup 2.5.5 it asked which folders you want to backup at first run, when you run **version** **3.0.1** for the first time, it asked you which folders to setup for "Remote Access".  "Wait a second...", I thought, why am I setting up folders for **Remote Access**?  What does that even mean in the world of PogoPlug?  I had no instruction manual or place to go for support.  As far as I could see, 3.0.1 had blown away Active Copy, my simple reliable backup process, and replaced it with Remote Access.

![Active-Copy1.png](/assets/pogoplug-software-and-support-issues/Active-Copy1.png)
![Remote-Access2.png](/assets/pogoplug-software-and-support-issues/Remote-Access2.png)

I found no mention of Active Sync anywhere in the client, so I turned on Remote Access and was horrified to now see that folders on my computer were being shared live on my.pogoplug.com.  What?!

I probably should not have been surprised by the functionality provided by Remote Access, but the way the feature was presented in version 3 made it seem like it was simply the new terminology behind Active Copy.  In reality, the Active Copy feature had been removed

PogoPlug had introduced a new "feature" that you no longer needed a PogoPlug box to use their services.  You could download the software, and pay for space in their cloud for backups to run.  Any device where you enabled Remote Access became a PogoPlug device.  Backups would only work from one Remote Access enabled device to another.

Because of this new design I now had to setup my PC as a sharing device in order to backup the files from there to my actual PogoPlug via the Web Ui

I found that jarring and confusing, and I despised this feature.  My computer was now a server.  Instead of being able to stage files to my PogoPlug and then share them, my computer had to be a server.  It was all or nothing.  I could not disable Remote Access and still have working backups.

I thought it was very misleading and confusing to change the function of the software in this manner.

Another alarming thing that emerged at this time was that you could now enter a Serial number to access the Premium Software.  I found that to be worrisome.  The box the PogoPlug comes in says "**Free Lifteime Service**".  Understandably, there's always money to be made from offering more features, but this flew in the face of everything I'd read about the PogoPlug when I bought it and had used it for the first several months.

I also found I was seeing a lot of reliability issues.  It seemed like the PogoPlug was constantly unable to see the connected Hard Drive, and I would have to go home, plug it into a Windows PC, run chkdsk, and re-connect it often.

That last update left a very bad taste, but at least things were working.

Most recently, another issue popped up, and motivated me to write this post to share my woes with others.

**Version 4**

For no apparent reason, my PogoPlug was not connecting to our WiFi and a look at my backups had me very worried.  Our backups had not been running for weeks at the very least, and when I went to the Web Ui backup menu, I saw that each folder I wanted to backup said "**Destination Folder Unavailable**"

Uh Oh

I inspected the problem in person, and worked with a PogoPlug tech to get the device back up and running.  All seemed to be fine, except that those nasty "Destination Folder Unavailable" messages would not go away.

After three days of emails with tech support, they let me know that the backup feature was now only to be used to backup a PogoPlug device to another PogoPlug device, and that backing up files from a PC should be done using Sync.

Wait a minute...when was that change made?  How long have my backups been failing then?  Again, I received no notice and the software had radically changed.  Not only that, but the technician went for three days seemingly oblivious to how his own product functioned.

This seemed to be the new implementation of the** version 4** release.  That update had been installed on our family laptop at some point, and I'm assuming backups had been failing ever since because we had no idea we had to totally re-implement them in a different way in the new software.

It seems like the PogoPlug company revived Active Sync in the form of Sync, but didn't bother to tell anyone.  So here I was thinking my backups were working fine, but they were not.

![Sync-Menu1.png](/assets/tmobile-password-confusion/Sync-Menu1.png)

Version 4, in my opinion, is the worst to date.   Sync only works if you have the Desktop Client up and running.  So it seems that in order for my backups to run I need the software minimized or in a Window at all times.  It's not enough to just have it running in the tray.

![Really-Quit.png](/assets/tmobile-password-confusion/Really-Quit.png)

So I need the software running for backups to work, but at least I can see how long it will take before the backups are complete, right?  Wrong!  There's no progress indicator anywhere.  I have no way of knowing if Sync is even working or not!

As the icing on the cake, even though the technician told me that Remote Access was now just that, a way of enabling Remote Access for a folder, I noticed that enabling Remote Access on a folder adds an entry to the backup menu.  So it seems like the software is broken, and the technician possibly has no idea what he's talking about.

![Broken-Web-UI.png](/assets/tmobile-password-confusion/Broken-Web-UI.png)

If Remote Access is no longer involved in the backup process, why does adding a folder to it automatically create an entry in the backup menu?  And why is that entry seemingly broken from the start?

No, that's the last straw.  I sent a nasty-gram to PogoPlug letting them know why I was so upset in the hopes that it will help them avoid issues with other customers, but I'm done with them.

You might read this and think "What a goober.  So the software changed twice while you've owned it and backups didn't run for a few months, so what?"  Well, you're right, I am a goober, but I also know that what PogoPlug is doing can be highly confusing to users.

1. When features in software change or are removed without notice.
1. If you add new features and don't explain what they do.
1. If you move major settings from a software application to a web interface with no notice.
1. When a task that involves uploading has no progress dialog.

I don't want a rebate, or apology, or promotional freebies.  I want PogoPlug to make better software.  Software that works like it's supposed to.  I want them to tell users, "Hey, your software is about to break because we're pushing an update!  Follow these steps to ensure everything is working right."

I'm going to bite the bullet and pay for space on DropBox.  It's reliable, fast, hassle free, and sharing is easy.

I'm going to install Arch Linux on this PogoPlug thanks to the efforts at [Arch Linux Arm](http://archlinuxarm.org/) and call it a night.  That or ipkg.  Anything to get me away from their Desktop Software.
