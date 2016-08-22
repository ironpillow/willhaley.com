---
title: "Octopress Maintenance"
slug: octopress-maintenance
date: 2015-05-08 14:58:24
---

I recently noticed, by means of a Google search, that an old post of mine was still alive and well on my Octopress site.  "That's odd", I thought, since the page no longer lived in my source control and the page still lived on even after running a `rake deploy`.

This was the culprit: `rsync_delete   = false` in my `Rakefile`

I had this set to `false` for a very particular reason.  My `public_html` directory is loaded not only with my Octopress files, but a number of other files that I use to host other sites from different domains using the same Apache instance.

I did not like the idea of manually deleting files from my server to delete stale content.  I wanted to enable `rsync_delete` so that I could run a `rake deploy` and know that my public server was totally in sync with my content, but I did not want to blow away all the other non-Octopress files in `public_html`.

I had been meaning to move my Octopress installation to a subdirectory for a while, and it seemed like now was the right time.

<!-- more -->

There are [plenty of articles describing how to deploy to a subdirectory](http://octopress.org/docs/deploying/subdir/), so I will not cover that.

What I will cover are the gotchas that I encountered.

Once I started deploying my site to a subdirectory under `public_html`, I was able to enable `rsync_delete` and delete the old post with a `rake deploy`.

However, to serve the site from this subdirectory, I would need some Apache `.htaccess` rules to be put in place.  I was a bit rusty on my Apache rewrite rules, and needed a refresher.

To clarify, I wanted Octopress to be served from the root URL for my domain, but for the files to live in a subdirectory on my HTTP server.

```
public_html/{blog,index.html,etc} -> public_html/octopress/{blog, index.html, etc}
```

And I wanted to still access my Octopress instance from my root URL.

```
# Should serve from public_html/octopress/blog
http://willhaley.com/blog
```

[Bluehost has a nice example .htaccess file that does the job](https://my.bluehost.com/cgi/help/347).  I removed a couple superfluous lines, and this is what mine ended up looking like.

```
RewriteEngine on

RewriteCond %{HTTP_HOST} ^(www.)?willhaley.com$
RewriteCond %{REQUEST_URI} !^/octopress/
RewriteRule ^(.*)$ /octopress/$1

RewriteCond %{HTTP_HOST} ^(www.)?willhaley.com$
RewriteRule ^(/)?$ octopress/ [L]
```

That worked for the most part, but I noticed I was getting some extra garbage in my URLs with those rewrite rules.  I was getting a URL like this `http://willhaley.com/octopress/blog/` when clicking a navigation link to `http://willhaley.com/blog`.

That seemed odd to me.  Why weren't the rewrite rules working?  Why was `octopress` showing up in the URL?  I wanted to serve Octopress *seamlessly* from a subdirectory.

It turns out the rewrite rules were working as expected, but I did not have my site configured as best I could to work with those rules.

My `navigation.html` links in Octopress looked like this.

```
<ul class="main-navigation">
  <li><a href="{{ root_url }}/">Home</a></li>
  <li><a href="{{ root_url }}/blog">Blog</a></li>
  <li><a href="{{ root_url }}/cv">CV</a></li>
  <li><a href="{{ root_url }}/blog/archives">Archives</a></li>
</ul>
```

The problem here was the lack of a trailing slash (`/`) after my navigation links.

Without the trailing slash, the rewrite rules could not determine that these were links to directories, and instead, assumed they were links to files, and was redirecting them.  That redirection to `.../octpress/blog/` *was* adding a trailing slash, and so it eventually worked.

Simply adding a `/` to the end of my navigation links got me the rest of the way there.

```
<ul class="main-navigation">
  <li><a href="{{ root_url }}/">Home</a></li>
  <li><a href="{{ root_url }}/blog/">Blog</a></li>
  <li><a href="{{ root_url }}/cv/">CV</a></li>
  <li><a href="{{ root_url }}/blog/archives/">Archives</a></li>
</ul>
```

Now I could rest easy knowing my Octopress powered site was being served correctly from a subdirectory and all my rewrite rules were working as expected.  I can run a `rake deploy` and know that my public site will be in exact sync with my local dev work.
