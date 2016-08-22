---
title: "Run Remote Commands in Vagrant"
slug: run-remote-vagrant-commands
date: 2017-01-15 09:50:00
---

This is a one liner to get into vagrant, run a command, and when that command exits, keep your SSH session up and running rather than terminating.

I learned how to do this thanks to [this StackOverflow article](http://stackoverflow.com/questions/22523134/running-remote-commands-after-vagrant-ssh).

You could easily turn this command into a shell alias.

```
(cd ~/wherever/you/want && vagrant ssh -- -t 'mongo; exec bash --login')
```

That example above `cd`s to the vagrant directory, uses `ssh` to open a terminal, runs `mongo`, and when the mongo command terminates, it starts a new shell.

What this does is save us a little hassle. We can run some alias like `vagrant-mongo`, and if we ever kill that command, we don't have to reconnect to the guest machine.

Not an incredible savings, but a convenience all the same.
