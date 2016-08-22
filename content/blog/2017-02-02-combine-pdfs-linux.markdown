---
title: "Combine PDF Files on Arch Linux"
slug: combine-pdfs-linux
date: 2017-02-02 22:08:00
---

This functionality is provided by the `pdfjam` package on Arch Linux.

```
# Join multiple pdfs, sorted by alpha
pdfjoin *.pdf
```

```
# Join multiple images, sorted by alpha
pdfjoin *.jpg
```

```
# Join pdfs as listed
pdfjoin 1.pdf 2.pdf 3.pdf
```

```
# Join everything into a pdf
pdfjoin *
```

I had a number of brief PDF files that I wanted to merge together into a single concatenated PDF. This is the sort of task that typically leads me down a rabbit hole of abandoned scripts and obscure apps.

I found many [articles](https://askubuntu.com/questions/100994/convert-pdf-to-image) on [this](https://stackoverflow.com/questions/2507766/merge-convert-multiple-pdf-files-into-one-pdf) [subject](https://linux.die.net/man/1/pdfjoin), which [recommended](https://askubuntu.com/questions/2799/how-to-merge-several-pdf-files) various [tools](https://blog.dbrgn.ch/2013/8/14/merge-multiple-pdfs/) for the [job](http://squelchdesign.com/web-design-newbury/how-to-concatenate-pdfs-in-linux/).

The resulting combined file from ghostscript (`gs`) had mangled tables and askew images. Unfortunately, the output was unusable.

`pdftk` sounded promising, but the install process for Arch is ridiculous. There's a yaourt package, but it relies on `gcc-gcj` (ugh, java) and `gcc-gcj-ecj` (a fork of the Eclipse bytecode compiler, double ugh). The compilation time was far more than I cared to wait for this sort of task, and I eventually killed it.

Imagemagick worked, but their `convert` util rendered text as images so the output PDF was unsearchable. The text was blurry and for reasons unknown my jobs were being killed when I tried to use sane values for higher quality results. That seemed odd considering I'm on a modern machine with ample RAM.

The winner for me was `pdfjoin` ala the `pdfjam` [package](http://go.warwick.ac.uk/pdfjam).

It generated a relatively small file, text was rendered properly and was searchable, tables and graphics were properly rendered, and it was high quality.
