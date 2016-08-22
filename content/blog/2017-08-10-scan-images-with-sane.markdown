---
title: "Scan Images With SANE"
slug: scan-images-with-sane
date: 2017-08-10 00:00:00
---

Simple scan with relatively nice resolution to `png` format.

```
scanimage \
	--format=png \
	--resolution=300 \
	> output.png
```

Force [US Letter](https://en.wikipedia.org/wiki/Letter_(paper_size)) dimensions. `x` and `y` correspond to `mm`. US Letter is `215.9` by `279.4` mm. Also, force grayscale mode.

```
scanimage \
	--format=png \
	-x 215.9 \
	-y 279.4 \
	--resolution=300 \
	--mode=Gray \
	> output.png
```

I then typically use `pdfjoin` to convert the page(s) to a `pdf` file. I often print these files via Google Chrome, and am sure to choose `Black and white` and to **not** choose `Fit to page`.

# Citations

* [SANE](https://wiki.archlinux.org/index.php/SANE)
