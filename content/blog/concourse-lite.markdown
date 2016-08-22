---
title: "Set Up Concourse Lite on Ubuntu"
date: 2017-03-21 10:41:00
---

Clone `concourse-docker` locally on Ubuntu.

```
git clone https://github.com/concourse/concourse-docker
```

Change to the `concourse-docker` directory.

```
cd concourse-docker
```

Generate keys for your local linux Concourse environment.

```
./generate-keys.sh
```

Run Concourse. _If you see an error regarding `Version in "./docker-compose.yml" is unsupported` then edit `docker-compose.yml` and change the `version` to `2`, or whatever is appropriate for your `docker-compose` version installed._

**Note that I am using the _real IP address_ for my machine. This is necessary. Also, note the credentials being set here.**

```
CONCOURSE_EXTERNAL_URL=http://192.168.1.103:8080 \
	CONCOURSE_BASIC_AUTH_USERNAME=concourse \
	CONCOURSE_BASIC_AUTH_PASSWORD=changeme \
	docker-compose up
```

**Open a new terminal window/tab.**

Download the Concourse Linux cli tool from your local instance now that it is running. The cli is called `fly`.

```
curl \
	-o fly \
	"http://localhost:8080/api/v1/cli?arch=amd64&platform=linux"
```

Make `fly` executable and put it in your `PATH`.

```
chmod +x fly && sudo cp fly /usr/local/bin/
```

Log in to your Concourse instance using `fly`. The credentials are what we specified above when we started Concourse. The username is `concourse` and the password is `changeme`.

```
fly -t lite login --concourse-url http://localhost:8080
```

This step should be unecessary, but if the cli and server are ever out of sync, this can change `fly` to the appropriate version.

```
fly -t lite sync
```

Create a sample, empty, pipeline.

```
touch my-pipeline.yml
```

Install your empty pipeline in Concourse.

```
fly \
	-t lite \
	set-pipeline \
	-p my-pipeline \
	-c my-pipeline.yml
```

Unpause your empty pipeline since it is paused by default when it is created.

```
fly \
	-t lite \
	unpause-pipeline \
	--pipeline my-pipeline
```

Create a simple task for Concourse. You could put this task file anywhere, but we will use the current directory for now. Create a file named `my-task.yml` in the current directory. Include the `---` at the top of the file.

```
---
platform: linux

image_resource:
  type: docker-image
  source:
    repository: debian
    tag: latest

inputs:
- name: scripts

run:
  path: scripts/my-script.sh
```

Create a scripts directory.

```
mkdir -p scripts
```

Create a simple bash script named `my-script.sh` inside the `scripts` directory.

```
#!/usr/bin/env bash

set -x

date

ls /
```

Make `my-script.sh` executable.

```
chmod +x my-script.sh
```

**Run it!**

```
fly \
	-t lite \
	execute \
	--config my-task.yml \
	--input scripts=./scripts
```

You should see your script run. Congratulations! You have just created a basic Concourse task on Linux.
