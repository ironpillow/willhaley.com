# willhaley.com

[Hugo](https://github.com/gohugoio/hugo) blog using a theme that is a clone of [Minima for Jekyll](https://github.com/jekyll/minima).

## Install

* Clone this repo
* Install [hugo](https://gohugo.io/) either via `go get` or your package manager
* `npm install -g firebase-tools`
* Install [gsutil](https://cloud.google.com/storage/docs/gsutil_install)
  * `curl https://sdk.cloud.google.com | bash`

## Serve locally

```
./serve.sh
```

## Build

```
./build.sh
```

## Deploy

```
./deploy.sh
```

## Standard Front Matter

Try and only use these tags when possible.

* `title` name of the content.
* `date` use the format `2017-10-07 00:00:00` (all dates are America/Chicago).
* `slug` manually specify post URLs.
* `published` disable a post by setting to `false`.
* `aliases` list of aliases for content.

## Front Matter Enhancements

* `date_modified` sets the last edited date (default: "")
* `archived` sets noindex on the meta to prevent indexing (default: false)
* `disqus` enable Disqus comments as needed (default: false)

## Shortcodes

* `cite` in the theme and used for citations.
* `tab-nav` and `tab` in the site (not the theme, since it is so specific) and used for simple tabs. Kind of ugly, but work.

## Comments

I am deprecating Disqus comments. Overall the discourse on my site is fine, but the energy and time I have to devote is a little more than I want. Also, Disqus comments do not support code blocks, formatting is a bit ugly, and more often than not my articles do not need them.

There are the only articles where I am keeping comments open due to the extensive feedback and consistent updates to the articles.

* https://willhaley.com/blog/linux-usb-wifi/
* https://willhaley.com/blog/custom-debian-live-environment/
* https://willhaley.com/blog/finding-linux-wifi-usb/

I hope to close comments on these eventually too. I may archive the comments in some form for these articles, and for the several dozen other articles where comments are available, but the threads are closed. If I can run an export someday to dump comments to static HTML, I may do that.

Readers are encouraged to use Twitter DMs to contact me going forward (tailed links on each article). Less maintenance, no need to worry about URL migrations.

## URL Redirects

Never _plan_ on migrating URLs later. For instance, do not plan to create `/trendy-article` and then retire it to another URL.

That never seems to work well with Disqus. Rather, use an alias to redirect from `/trendy-article` to `/canonical-url` and then just update the redirect as needed.

## Style

### English

#### [Titles](http://english.stackexchange.com/questions/14/which-words-in-a-title-should-be-capitalized)

> In Titles: Do Capitalize
> * Nouns (man, bus, book)
> * Adjectives (angry, lovely, small)
> * Verbs (run, eat, sleep)
> * Adverbs (slowly, quickly, quietly)
> * Pronouns (he, she, it)
> * Subordinating conjunctions (as, because, that)
>
> In Titles: Do Not Capitalize
> * Articles: a, an, the
> * Coordinating Conjunctions: and, but, or, for, nor, etc.
> * Prepositions (fewer than five letters): on, at, to, from, by, etc.

#### Quotations

When quoting a person, use `"` (quotes). When quoting a variable, command, or text from a website use `` ` `` (backticks).
