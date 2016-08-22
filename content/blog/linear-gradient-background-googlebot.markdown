---
title: "linear-gradient Backgrounds With Googlebot"
date: 2018-02-19 16:01:00
---

It was [recently pointed out to me](https://willhaley.com/blog/googlebot-crawler/#comment-3746090924) that Googlebot may try and filter out content that seems to be cheating the system.

For example, something like white text on a white background. In that scenario viewers would not be able to see the text, but crawlers might.

It appears Google _does_ try and filter out that sort of dishonest content, which seems like the correct choice since that sort of content is purely to cheat SEO and not for the sake of users.

I noticed that this behavior gets a little interesting when used with a `linear-gradient`. See below for some observations and conclusions I drew.

# High Contrast - No Problem

```
background: #000;
color: #fff;
```

A black background with white text renders fine and Googlebot renders it without issue.

### As Viewed By Humans

![high contrast web rendering example](/images/linear-gradient-background-googlebot/white on black.png)

### As Viewed By Googlebot

![high contrast web rendering example as viewed by google](/images/linear-gradient-background-googlebot/white on black (bot).png)

# No Contrast - Googlebot Ignored

```
background: #fff;
color: #fff;
```

A white background with white text is not rendered by Googlebot. Note that a human would see an empty gap where the invisible content is occupying space in the DOM. Googlebot, alternatively, does not render the content at all.

### As Viewed By Humans

![no contrast web rendering example](/images/linear-gradient-background-googlebot/white on white.png)

### As Viewed By Googlebot

![no contrast web rendering example as viewed by google](/images/linear-gradient-background-googlebot/white on white (bot).png)

# Gradient - Googlebot Ignored

```
background: linear-gradient(to right, #000, #111);
color: #fff;
```

A gradient background, even if it results in a high contrast result, is ignored by Googlebot. It _seems_ Googlebot does not like the idea of a `linear-gradient` at all in this case, because it treats this very dark background the same as it did for white text on a white background.

### As Viewed By Humans

![high contrast gradient web rendering example](/images/linear-gradient-background-googlebot/white on black gradient.png)

### As Viewed By Googlebot

![high contrast gradient web rendering example as viewed by google](/images/linear-gradient-background-googlebot/white on black gradient (bot).png)

# Gradient With Fallback - Works Great

```
background: #000 linear-gradient(to right, #000, #111);
color: #fff;
```

Unlike the gradient background above, here we define a fallback of `#000`, and now Googlebot renders the content without issue. It would appear that Googlebot will accept a valid gradient as long as there is a solid fallback color.

**Note, I tried using a `#fff` background and the content did not render**

I would conclude that Googlebot is completely ignoring the `linear-gradient`. My `linear-gradient` example with no fallback fails because Googlebot defaults to a white background in that case, and the white text fails to render.

With the dark fallback background, Googlebot will render the content.

### As Viewed By Humans

![high contrast gradient with solid fallback web rendering example](/images/linear-gradient-background-googlebot/white on black gradient with fallback.png)

### As Viewed By Googlebot

![high contrast gradient with solid fallback web rendering example as viewed by google](/images/linear-gradient-background-googlebot/white on black gradient with fallback (bot).png)
