---
title: "Print Directory Tree With Sizes"
slug: print-directory-tree-with-sizes
date: 2017-01-29 10:11:00
---

This command uses `find` to recursively print all files and directories under a given directory tree.

The `-printf` option allows us to print the `%p` path and `%s` size.

We print them in that order so that when we `sort`, we sort on the path, and not the file size.

```
find . -printf "%p %s\n" | sort
```

This can be helpful if you run some sort of process against a directory, and want to see how the files change.

You can do something like this.

```
find . -printf "%p %s\n" | sort > /tmp/1.txt
# Run some process.
find . -printf "%p %s\n" | sort > /tmp/2.txt
```

That will allow you to then compare `git diff 1.txt 2.txt` to see which files changed.

I tried implementations using `wc`, `ls`, and `xargs`, but this seems the simplest in my opinion.
