---
layout: post
title: "Different SSH Users For Vagrant SSH and Vagrant Up (Provision)"
date: 2015-09-16 19:46:53 -0500
comments: true
categories: 
---

I have a Vagrant box where I want to SSH in as the standard `vagrant` user for the initial provision and deployment, but I want to use my own alternate custom user account for my dev work.

I want to use `vagrant` for the initial deploy as that is the standard user for many vagrant machine images. Adding my own user into the image would be a pain, and would prevent me from being able to use a standard Vagrant image.

I want to add my custom `deploy` user during provisioning, and use that for my dev work, because that is the account my staging and production servers use. Having this user account present for dev work will allow me to be more consistent with our real environments.

Unfortunately, that was a bit more challenging to do than I would have anticipated, and I could not find an option in the Vagrant docs that would allow me to use two different users for `vagrant up` and `vagrant ssh`.

Eventually, I found [this solution](https://github.com/mitchellh/vagrant/issues/1753#issuecomment-53970750) by GitHub user [danielfrg](https://github.com/danielfrg).

Edit your `Vagrantfile` and add this conditional in the `configure` block.

	VAGRANT_COMMAND = ARGV[0]

	Vagrant.configure("2") do |config|
		if VAGRANT_COMMAND == "ssh"
			config.ssh.username = 'other_username'
		end

		...
	end

Perfect. Now my `other_username` (`deploy` in my case) will only be used if the `ssh` argument is passed to `vagrant`.

