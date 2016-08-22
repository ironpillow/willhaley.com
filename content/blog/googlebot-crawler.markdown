---
title: "Googlebot Is Not Chrome"
date: 2017-12-27 13:04:00
disqus: true
---

I recently created a trivial demo SPA (single page app) with [Ember.js](https://www.emberjs.com/). I wanted to see how Google might naturally crawl my site and index it for Google Search results.

My website is using a very unique and nonsensical name that overlaps with _no other_ search results, so it was easy to search on and see what was and was not indexed. Initially, Google had no search results for my site's name.

![no search results for my site](/images/googlebot-crawler/no-seo.png)

I created a [Google Webmaster](https://www.google.com/webmasters/tools/home?hl=en) entry for my trivial site and used the `Fetch as Google` tool to `Fetch and Render` my site.

![fetch site as Google](/images/googlebot-crawler/fetch.png)

I also clicked `Request Indexing` so that Google would `Crawl this URL and its direct links`.

![index site](/images/googlebot-crawler/index.png)

I waited a few days to see how Google had indexed my content.

The home page was indexed, as was the `/api` page, but some of my content was not searchable and did not seem to be picked up by Google at all. Specifically, I noticed the `/about` page was not indexed, which seemed odd since it was directly linked from my home page.

![some results](/images/googlebot-crawler/some-content-indexed.png)

My `robots.txt` allows all, so nothing should be blocked for Googlebot. And although I have no [Sitemap](https://en.wikipedia.org/wiki/Sitemaps), which would "...inform search engines about URLs on a website that are available for crawling.", my content had a number of links that should have been crawable by Googlebot.

I looked at the result of [Google's Webmaster Crawl Tool](https://www.google.com/webmasters/tools/googlebot-fetch) to `Fetch as Google` my `/` home (index) page URL.

It was at this point I realized that Google's crawl process was not seeing my nav bar. The navigation was completely missing from Google's crawl and render of my site.

The result of that crawl request does not show my nav bar even though I can see the nav bar in my modern browser. Google states that "This is how Googlebot saw the page:" and "This is how a visitor to your website would have seen the page:". See here a screenshot of the result.

![no nav visible when rendered by googlebot](/images/googlebot-crawler/missing-nav.png)

That same navigation bar in my single page app renders without issue in production in Safari, Firefox, and Chrome. See here a screenshot of what the home page (`/`) looks like in Chrome `62.0.3202.94 (Official Build) (64-bit)`. Note the nav bar at the top.

![screenshot of website with nav](/images/googlebot-crawler/nav-renders.png)

At this point I was perplexed. Clearly Googlebot was having an issue with an aspect of my site, but I had a hard time understanding why Google would vary so significantly from what I could see in my browser. **If I can see the nav bar in my modern browser, why can't Googlebot?** **Why is the navigation bar not rendered by Google's crawl process?**

# Why is the navigation bar not rendered by Google's crawl process?

The nav bar had a `linear-gradient` css rule. If that rule is removed, the nav bar renders fine when using the `Fetch and Render` tool in the Google Webmaster Search Console. It is interesting to note that this one CSS rule seems to prevent the entire navigation DOM element from rendering properly by Googlebot.

So, this does not seem to be an SPA/AJAX-driven site problem, but rather a CSS problem for Googlebot's rendering process.

Googlebot is either unable or unwilling to process the `linear-gradient`, and the resulting CSS sans `linear-gradient` is not rendered by Googlebot.

Once I removed the `linear-gradient` and changed the `background` to a simple color, Googlebot could see my nav bar.

![navigation rendering normally](/images/googlebot-crawler/fixed.png)

# If I can see the nav bar in my modern browser, why can't Googlebot?

I initially assumed my nav bar issue was somehow because I was using an SPA despite Google [saying the following regarding an AJAX-powered SPA like the one I am using](https://webmasters.googleblog.com/2015/10/deprecating-our-ajax-crawling-scheme.html).

> Today, as long as you're not blocking Googlebot from crawling your JavaScript or CSS files, we are generally able to render and understand your web pages like modern browsers.

Although that statement is in regards to Javascript heavy/client-side sites, it seems clear to me now that it applies to _all_ the content they crawl. My understanding now is that **Googlebot does _not always_ render and understand your website like a modern browser would.**

Based on Google's statement about crawling, I had assumed that if I can see the content with my human eye in my modern browser for my website, then Google's crawl process via Googlebot should be able to render and analyze that content too, but clearly that is not the case. **It has nothing to do with my site being an SPA**. Rather, it is because my site was using a CSS rule that did not play well with Googlebot.

Googlebot is [based on an older build of Chrome. Specifically, a build of version 41](https://developers.google.com/search/docs/guides/rendering). It is possible to [install Chrome 41](http://google-chrome.en.uptodown.com/ubuntu/old) on a [compatible OS](http://releases.ubuntu.com/14.04/). I did so, and I do see the nav bar renders fine on a desktop with Chrome 41 and works as expected. See here the nav bar rendering fine in Chrome `41.0.2272.89 (64-bit)`.

![nav renders fine in chrome 41](/images/googlebot-crawler/chrome41.png)

Although my site works fine on Chrome 41, the issue with my site and Googlebot seems to be a case where it must be noted that **Googlebot's web rendering service (WRS) is _not_ the same as Chrome**.

[Other articles](https://moz.com/blog/google-shares-details-googlebot) highlight this discrepency.

> From what we noticed, Google Search Console renders CSS a little bit different than Chrome 41. This doesn’t happen often, but as with most tools, we need to double check whenever possible.

# Conclusion

Although the immediate fix for this was updating my CSS, my fundamental confusion and interest is _why_ Googlebot does not behave like a modern browser for this CSS rule. The CSS works fine in Chrome 41, so why not in Googlebot?

I have [another article]({{<relref "linear-gradient-background-googlebot.markdown" >}}) that may answer that question thanks to the comment by Daniel Aleksandersen.

Fundamentally, my takeaway is that **Googlebot is _not_ the same as Chrome**. It does not render content the same, and it is clear to me now that modern CSS can cause issues for Googlebot and prevent content from being crawled.

**Test your site against Google's Webmaster Tools early and often.**

# Citations

* https://productforums.google.com/forum/#!topic/webmasters/jXqRcnWN8Ng
* https://www.elephate.com/blog/javascript-seo-experiment/

