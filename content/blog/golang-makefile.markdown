---
title: "Using a Makefile with Golang"
date: 2018-02-01 21:22:00
---

I've found that using a `Makefile` is helpful for running and building Go projects.

You can create a very complex `Makefile` to coordinate a number of build tasks. However, I will not focus on a complex setup here. Rather, this is a quick and dirty generic `Makefile` that I like to use for demo or throwaway projects.

You could just as easily use a `bash` script, but I prefer a `Makefile`. My example will not cover all scenarios, but I like using this as a generic build process for my one-off standalone Go apps.

You should read up on [setting the GOPATH](https://github.com/golang/go/wiki/SettingGOPATH) to understand how to set up a reliable `GOPATH` for long term development. My `Makefile` is specifically overriding the `GOPATH` to the current directory. That is because this example `Makefile` is designed for throaway projects. This is probably _not ideal_ for most workflows, but that is up to you to decide.

```
# Makefile

export GOPATH := $(shell pwd)

all:
	echo $$GOPATH
	go get -d
	go run *.go

build:
	echo $$GOPATH
	go get -d
	go build -o out.bin
```

Then simply run `make` to run your Go app.

You can also run `make build` to build a binary for your Go app.

Dependencies get downloaded to `./src`. Note, this is a _relative_ path. The dependencies will end up in the _current directory_ with your `Makefile` and Go code due to how I am setting the `GOPATH`.
