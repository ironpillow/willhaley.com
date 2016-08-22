---
layout: post
title: "T-Mobile Password Confusion"
date: 2012-02-26 0:38:00 -0500
comments: true
categories:
published: true
---

Last week I signed into t-mobile.com and received a message requesting that I update my password as part of a security upgrade. "Fair enough", I thought.  My password on T-Mobile was pretty weak and could use some updating, and if this was part of a larger security upgrade on their part, then by all means, update away.

I tried my standard method for creating a strong (but unique) password for that site, and was met with an annoying limit on special characters.  So I came up with a random string of characters that fit the bill, updated my password, and thought everything was done with.

A week later, I received a txt message from T-Mobile stating that my password had been updated, and that if this was unauthorized, I should contact T-Mobile support.

I went from confusion to feeling incensed almost immediately. "Wait a minute, did this txt about me updating my password arrive a WEEK late?", I thought. I tried to log in to verify that all was well with my account, and found that my password was failing, which had me concerned.  Maybe my account had actually been compromised and it just happened to coincide with my recent password update.

<!--more-->

I called T-Mobile support and the second recorded message I heard was regarding this txt message I'd received. As it turns out, T-Mobile managed to botch this security upgrade and txt confirmations were indeed being sent up to a week after the actual password updates.  They realized this was a problem and were letting customers calling into the support line know that they should not be concerned.

So at least that should explain the txt message, but why was my password not working? A quick look at my KeePass password database made me confident that I was using the correct password.  So I finally surrendered and clicked on the link to reset my password, which filled in the last piece of the puzzle.  It seemed T-Mobile somehow, somewhere along the line, had truncated my password without warning me.

**Unacceptable!**

Some investigation led me to the real cause of the problem.  T-Mobile caps the password at 15 characters in their HTML, but their Javavscript validation doesn't say so when you're typing your password.

```
<span style="COLOR: black">New password:</span><br />
<input type="password" maxlength="15"/>
```

Their instruction text states that there must be a minimum of 8 characters on the change password page, but says nothing about a maximum.

Further, there are inconsistent password requirements listed between the change password and login pages.  The login page says your password must be between 4 and 15 characters.  I figured this maximum of 15 characters could be my issue, because a quick look at my password revealed that I was at 16.  I can see the HTML for the "4-15" limit error message on the change password page, but that message doesn't become visible when needed, and anyway, that text conflicts with their own instruction text if you look at the screenshots below.

```
<span id="msgPasswordLength" style="display: none;"><div style="COLOR: red">
Sorry-your new password must be between 4 and 15 characters.
<br /></div></span>
```

How can any major site truncate or limit password length without giving the user some kind of notice?  Today, a week after my initial discovery, I see that the change password feature is still limiting password length.  There's no warning to the user that input is not being accepted after 15 characters.

I've encountered this before. Either from length restrictions or my use of a trailing special character, United.com truncated part of my password without telling me.

This is super frustrating.

<img src="/downloads/update-password.png" width=200 >
<img src="/downloads/login-failed.png" width=200 >

