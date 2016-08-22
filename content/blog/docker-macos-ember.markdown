---
title: "Docker, macOS, and Ember"
date: 2017-11-12 16:47:00
---

Poor Docker performance on macOS is a [well](https://docs.docker.com/docker-for-mac/troubleshoot/#known-issues) [documented](https://github.com/docker/for-mac/issues/77) [issue]({{<relref "ember-docker-build-performance.markdown" >}}). This is **not an Ember issue**, but rather, an issue with Docker and macOS.

After months of working with a hobbled and hacked together Docker build environment, I gave [docker-sync](https://github.com/EugenMayer/docker-sync) with [Unison](http://www.cis.upenn.edu/%7Ebcpierce/unison/) a try and it has worked **wonderfully**.

**I can finally use Ember with Docker without a horrible performance hit! Thank you docker-sync and Unison!**

I would like to point out that [docker-sync](https://github.com/EugenMayer/docker-sync) has [extensive documentation](https://github.com/EugenMayer/docker-sync/wiki) and you should read their docs.

For the sake of this article, I am using the [Ember super-rentals demo app](https://github.com/ember-learn/super-rentals) for demonstration.

# Installation

I am assuming you have already installed [Docker](https://docs.docker.com/docker-for-mac/install/) and are comfortable installing ruby gems on your system.

Install docker-sync.

```
gem install docker-sync
```

Clone the [super-rentals](https://github.com/ember-learn/super-rentals) app.

```
git clone https://github.com/ember-learn/super-rentals
```

# Configuration

Create a `docker-sync.yml` file in the root of `super-rentals`.

```
version: 2
syncs:
  super-rentals-sync:
    src: '.'
```

Create a `docker-compose.yml` file in the root of `super-rentals`.

```
version: '2'
services:
  super-rentals:
    image: 'node:8.9.1'
    command: '/bin/bash'
    volumes:
      - super-rentals-sync:/app:nocopy

volumes:
  super-rentals-sync:
    external: true
```

# Run

Start `docker-sync`.

```
docker-sync start
```

Run our container with the synced volume.

```
docker-compose \
    run \
    --rm \
    --name=super-rentals \
    -p 4200:4200 \
    -p 7020:7020 \
    -w /app \
    super-rentals
```

Install `ember-cli` in the container.

```
npm install -g ember-cli
```

Install node modules.

```
yarn install
```

Run the ember server.

```
ember s --live-reload-port 7020
```

You should now be able to access your app at `http://localhost:4200` and update it like normal!

# Follow-Up

You can stop the `docker-sync` container like so.

```
docker-sync stop
```

At this point you should be able to use Docker and Ember like normal. You can create your own Docker image and customize these steps as you see fit.
