---
title: "Pipe Arguments To Bash Function"
slug: pipe-arguments-to-base-function
date: 2016-12-17 10:49:23
---

This is a trivial example, but is meant to demonstrate how you can pipe arguments to a bash function.

```
#!/usr/bin/env bash

lowercase()
{
	# Grab input.
	declare input=${1:-$(</dev/stdin)};

	# Use that input to do anything.
	echo "$input" | tr '[:upper:]' '[:lower:]'
}

echo "HELLO there, FRIEND!" | lowercase
```

Which outputs the following.

```
hello there, friend!
```
