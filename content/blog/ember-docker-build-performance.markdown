---
title: "Ember Build Performance With Different Environments"
date: 2017-11-09 09:23:00
---

I have found that building Ember on Linux (with and without Docker) and Mac (without Docker) are fairly fast and all reasonably close in speed.

Each of those environments built in **less than 15 seconds** for me.

The **major performance outlier** was [Docker for Mac](https://docs.docker.com/docker-for-mac/install/). With Docker for Mac, builds took **1 minute and 16 seconds**. The [performance](https://forums.docker.com/t/file-access-in-mounted-volumes-extremely-slow-cpu-bound/8076/198) [issues](https://forums.docker.com/t/alternatives-to-osxfs-performant-shares-under-osx/19565) using Docker for Mac [are](https://github.com/docker/for-mac/issues/689) [well](https://github.com/docker/for-mac/issues/77) [documented](https://docs.docker.com/docker-for-mac/troubleshoot/).

I want to specifically call out the [official Docker documentation](https://docs.docker.com/docker-for-mac/troubleshoot/) that shows this **is not an Ember issue, but rather, a macOS and Docker issue that effects multiple frameworks and tools**. Docker has a [lengthy article on these issues](https://docs.docker.com/docker-for-mac/osxfs/#performance-issues-solutions-and-roadmap).

> There are a number of issues with the performance of directories bind-mounted with osxfs ... Applications that behave in this way include:

>    * rake
>    * ember build
>    * Symfony
>    * Magento
>    * Zend Framework
>    * PHP applications that use Composer to install dependencies in a vendor folder

[I have found]({{< relref "docker-macos-ember.markdown" >}}) that **[docker-sync](https://github.com/EugenMayer/docker-sync) was the simplest and most performant solution to this issue**. Build times came in at **20 seconds**, which is obviously _fantastic_ compared to "normal" Docker for Mac speeds. I had tried a number of other workarounds beforehand. rsync scripts, Samba, NFS, but nothing worked quite as well as `docker-sync`.

See test data and information here.

* [Linux Test]({{<relref "#linux" >}})
* [Mac Test]({{<relref "#mac" >}})
* [Docker on Linux Test]({{<relref "#docker-linux-host" >}})
* [Docker on Mac Test]({{<relref "#docker-mac-host" >}})
* [Docker on Mac (with docker-sync) Test]({{<relref "#docker-mac-host-with-docker-sync" >}})

<!--

This is due to limitations in [macOS](https://docs.docker.com/docker-for-mac/osxfs-caching/#performance-implications-of-host-container-file-system-consistency).

> The current implementations of mounts on Linux provide a consistent view of a host directory tree inside a container ...
>
> On Linux, these guarantees carry no overhead ... However, on macOS (and other non-Linux platforms) there are significant overheads to guaranteeing perfect consistency, since messages describing file system actions must be passed synchronously between container and host.

Docker's [official documentation](https://docs.docker.com/docker-for-mac/troubleshoot/#known-issues) calls out workarounds, and [there](https://medium.freecodecamp.org/speed-up-file-access-in-docker-for-mac-fbeee65d0ee7) [are](https://github.com/stephank/docker-for-mac-nfs) [a](https://github.com/IFSight/d4m-nfs) [number](http://docker-sync.io/) [of](https://github.com/docker/for-mac/issues/1592) [them](https://github.com/TomFrost/fs_eventbridge) [available](https://github.com/codekitchen/dinghy).
-->

# Linux

```
Could not start watchman
Visit https://ember-cli.com/user-guide/#watchman for more info.
cleaning up...
Built project successfully. Stored in "dist/".

real	0m14.923s
user	0m14.732s
sys	0m0.800s
```

# Mac

```
cleaning up...
Built project successfully. Stored in "dist/".

real	0m8.543s
user	0m6.825s
sys	0m2.156s
```

# Docker (Linux Host)

```
Could not start watchman
Visit https://ember-cli.com/user-guide/#watchman for more info.
cleaning up...
Built project successfully. Stored in "dist/".

real	0m14.633s
user	0m14.752s
sys	0m0.921s
```

# Docker (Mac Host)

```
Could not start watchman
Visit https://ember-cli.com/user-guide/#watchman for more info.
cleaning up...
Built project successfully. Stored in "dist/".

real	1m16.261s
user	0m19.710s
sys	0m5.730s
```

# Docker (Mac Host _with docker-sync_)

```
Could not start watchman
Visit https://ember-cli.com/user-guide/#watchman for more info.
cleaning up...
Built project successfully. Stored in "dist/".

real	0m20.308s
user	0m17.530s
sys	0m2.040s
```

# How I Tested

I would like to stress that these tests were not very scientific, and were subject to a number of environmental issues (what else was I running on my machine at the time? Was my hard drive or CPU being stressed?).

My goal was not to show the most accurate performance characteristics, but rather, to show how performance (relatively) varies between different builds environments. I hope this will successfully detail how dramatically performance can change between these different scenarios.

## Linux and macOS

Wipe out the current `$HOME/.nvm` install.

```
rm -rf ~/.nvm/
```

Reinstall [NVM](https://github.com/creationix/nvm).

Install latest **lts** version of node. Verify the system is using it.

```
nvm install --lts && which node
```

Install `ember-cli` with npm.

```
npm install -g ember-cli
```

Clone [super-rentals](https://github.com/ember-learn/super-rentals).

```
git clone https://github.com/ember-learn/super-rentals
```

Change to the `super-rentals` directory.

```
cd super-rentals
```

Use yarn to install node modules.

```
yarn install
```

Time a build.

```
time ember build
```

# Docker on Linux and macOS

Clone [super-rentals](https://github.com/ember-learn/super-rentals).

```
git clone https://github.com/ember-learn/super-rentals
```

Run a docker container for node **lts** (at time or writing, `node:8.9.1`) with `super-rentals` mounted inside.

Install `ember-cli` with npm.

```
npm install -g ember-cli
```

Change to the `super-rentals` directory.

```
cd /super-rentals
```

Use yarn to install node modules.

```
yarn install
```

Time a build.

```
time ember build
```
