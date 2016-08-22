---
title: "Deploy an HTML Web App With Nginx Config Changes Without Passwords"
slug: deploy-an-html-web-app-with-nginx-config-changes-without-passwords
date: 2016-11-05 12:26:10
---

I want to be able to run a single script from my client machine, and push HTML changes and nginx config changes to a remote server. I do not want to be prompted for passwords or any sort of confirmation at any point in this process.

This requires a number of steps, but is certainly doable.

<!-- more -->

# Client SSH key

First, make sure you have an SSH key on your client that is not password protected.

You can use `ssh-keygen` to generate a new key if needed.

```
# Run this on the client.
ssh-keygen -t rsa
```

[Here are](https://help.github.com/articles/checking-for-existing-ssh-keys/) a [couple guides](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/) that explain the basics for SSH keys.

# Deploy user

Add a `deploy` user on the server.

```
# Run this on the server.
sudo useradd -m -s /bin/bash deploy
```

# SSH access for deploy user

Create the appropriate directories and files on the server.

```
# Run this on the server.
sudo mkdir /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh/
sudo chmod 700 /home/deploy/.ssh/
sudo touch /home/deploy.ssh/authorized_keys
```

Grant the SSH key from the _client_ access on the _server_. Do this by appending the public SSH key (typically `id_rsa.pub`) from the client to the `/home/deploy/.ssh/authorized_keys` file on the remote server.

It is as simple as a copy and paste, but there are [many guides online](http://askubuntu.com/questions/46424/adding-ssh-keys-to-authorized-keys) that explain how to do this.

Ensure the permissions are correct for the `authorized_keys` file.

```
# Run this on the server.
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

This will enable passwordless SSH authentication. This way, the server will never prompt for a password when connecting.

# Passwordless nginx changes

Change the ownership of nginx config directories so that the `deploy` user can edit them without needing `sudo` access.

```
# Run this on the server.
sudo chown root:deploy /etc/nginx/{sites-enabled,sites-available}
sudo chmod 775 /etc/nginx/{sites-enabled,sites-available}
```

On the server, add a special `sudoers` config so that the `deploy` user can run `service nginx restart` without needing a password.

```
# /etc/sudoers.d/deploy
deploy ALL=(ALL) NOPASSWD: /usr/sbin/service nginx restart
```

```
# Run this on the server.
sudo chmod 0440 /etc/sudoers.d/deploy
```

Now the deploy user can run `sudo service nginx restart` without a password, and only that command.

# Leveraging our changes

With everything in place, we should now be able to smoothly run a deploy from the client.

Here is an example for my own site that I use when deploying to Digital Ocean.

First, I copy my files to the server with a `deploy.sh` script.

Run this on your client.

```
#!/bin/bash

rsync \
	-avze 'ssh -o StrictHostKeyChecking=no' \
	--delete \
	./ deploy@willhaley.com:/srv/willhaley.com/

ssh deploy@willhaley.com '/bin/bash /srv/willhaley.com/bounce.sh'
```

Note the `StrictHostKeyChecking=no`. This prevents the client from asking if the server should be trusted or not.

Note also where the `bounce.sh` command is run on the remote server. That is the command that configures and restarts nginx on the remote server.

`bounce.sh` is a command that handles the nginx updates. Here is an example.

```
#!/usr/bin/env bash

cp /srv/nginx/willhaley.com/config/willhaley.com.conf /etc/nginx/sites-available/
ln -fs /etc/nginx/sites-available/willhaley.com.conf /etc/nginx/sites-enabled/

sudo service nginx restart
```

Based on how we modified permissions earlier, and granted access to `deploy` to restart nginx without a password, this can all be kicked off by the client without any password prompts.

# Citations

1. [Non-privileged, non-root, user to start or restart webserver server such as nginx without root or sudo](http://stackoverflow.com/questions/21830644/non-privileged-non-root-user-to-start-or-restart-webserver-server-such-as-ngin)
1. [How can I avoid SSH's host verification for known hosts?](http://superuser.com/questions/125324/how-can-i-avoid-sshs-host-verification-for-known-hosts)
1. [Upstart: allowing a normal user to stop and start my custom service](http://serverfault.com/questions/390687/upstart-allowing-a-normal-user-to-stop-and-start-my-custom-service)
1. [How to modify a invalid /etc/sudoers file? It throws out an error and not allowing me to edit again](http://askubuntu.com/questions/73864/how-to-modify-a-invalid-etc-sudoers-file-it-throws-out-an-error-and-not-allowi)
