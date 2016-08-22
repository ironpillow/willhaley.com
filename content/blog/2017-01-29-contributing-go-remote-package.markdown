---
title: "Contributing to a Remote Go Package"
slug: contributing-go-remote-package
date: 2017-01-29 10:24:00
---

I have never contributed work to a Go remote package before, but I recently tried this for the first time. In my case I worked on a fork of [negroni](https://github.com/urfave/negroni).

These steps might not be the best, and some steps might be superflous, but they worked for me.

First, I deleted my local `negroni` directory from `src`.

```
rm -rf src/github.com/urfave/negroni
```

I also deleted the compiled files.

```
rm -rf pkg/*/github.com/urfave
```

At this point, I had a fork of `negroni` in github. I replaced all references to `github.com/urfave/negroni` with `github.com/williamhaley/negroni` in my code.

Once that was done, I ran the following to download my fork and build it.

```
# This assumes you have a properly defined GOPATH and GOBIN.
go get -d github.com/williamhaley/negroni
go install github.com/williamhaley/negroni
```

Once my changes were merged in, I ran this process again, but deleting and replacing references to my fork with references to the original `negroni` source.
