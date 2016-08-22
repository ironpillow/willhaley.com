---
title: "Getting My Jekyll Blog on AWS S3 with Semaphore CI"
slug: getting-my-jekyll-blog-on-aws-s3-with-semaphore-ci
date: 2016-10-04 15:51:01
---

My guide is largely based on the [Deploying to Amazon S3](https://semaphoreci.com/docs/deploying-to-amazon-s3.html) guide from Semaphore, but with some pre-requisite steps and fine-tuning to S3.

**Switching your DNS provider for your domain to Amazon's Route 53 may be a requirement. Depending on your DNS provider, your DNS configuration, and your willingness to jump through hoops like setting up a reverse proxy on another server, you may be forced to transfer your domain. You should absolutely read the DNS and hosting section of Amazon's [Static Website Using a Custom Domain](https://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html) guide before proceeding.**

Before following the Semaphore guide, check out [Writing IAM Policies: How to Grant Access to an Amazon S3 Bucket](https://blogs.aws.amazon.com/security/post/Tx3VRSWZ6B3SHAV/Writing-IAM-Policies-How-to-Grant-Access-to-an-Amazon-S3-Bucket) and
[An Example Walkthrough: Using user policies to control access to your bucket](http://docs.aws.amazon.com/AmazonS3/latest/dev/walkthrough1.html) in order to better understand and implement more granular AWS authorization and access.

You should also read the [Example: Setting Up a Static Website Using a Custom Domain](https://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html) guide.

<!-- more -->

## Create Buckets

AWS Web Console -> `S3` -> `Create Bucket` -> enter the domain of your site for the bucket name. In my case it is `willhaley.com`.

I prefer to use the domain of my site for the bucket name. It makes things much simpler if you follow a similar convention and name buckets to reflect site domains.

`Save` these changes.

Select the bucket -> `Properties` -> `Static Website Hosting`. Note the `Endpoint`. In my case, it is `http://willhaley.com.s3-website-us-east-1.amazonaws.com/`.

We will need that URL later.

Select the option to `Enable website hosting` -> `Save`.

Since I plan to serve my site at `http://willhaley.com`, I want to redirect requests from `www` to the root domain.

AWS Web Console -> `S3` -> `Create Bucket` -> `www.willhaley.com`.

Select the `www.willhaley.com` bucket -> `Properties` -> `Static Website Hosting` -> `Redirect all requests to another host name` -> `Redirect all requests to` should be set to the desired domain. In my case it is `willhaley.com`. `Save` these changes.

## Create User

AWS Web Console -> `Security Credentials` -> `Users` -> `Create New Users`. Make sure that `Generate an access key for each user` is checked.

Use `semaphore-user-THE_DOMAIN_OF_YOUR_SITE` as your username, or some other variant. I prefer having a separate user for each site in Semaphore that I will deploy to S3. That way, if one account is compromised, it will not result in risking other sites.

In my case, the username is `semaphore-user-willhaley.com`.

After creating the account, `Show User Security Credentials` and record that information someone secure!

_Note: For some odd reason, my downloaded credentials file added a `%` suffix. Might have just been something odd on my machine, but be on the lookout if you encounter any issues getting Semaphore to authenticate later on. I thought the `%` was part of the credentials at first, and wasted some time with that._

## Create Group

AWS Web Console -> `Security Credentials` -> `Groups` -> `Create New Group`. Again, I prefer to use a name like `semaphore-group-THE_DOMAIN_OF_YOUR_SITE`.

In my case that would be `semaphore-group-willhaley.com`. I know, it is a bit redundant to put `group` in the name, but I'd rather be explicit and verbose. These names will rarely be used, so I am not too concerned about them being long.

Do not grant any permissions to the group. Instead, click `Next Step` and `Create Group`.

## Add Users to Group

AWS Web Console -> `Security Credentials` -> `Groups`. Click on the name of your group. In my case, it is `semaphore-group-willhaley.com`.

`Users` -> `Add Users to Group`. Select your user. In my case, it is `semaphore-user-willhaley.com`. Click `Add Users`.

You may be wondering why we need a group with only one user. As the AWS docs mention in [Creating an IAM User in Your AWS Account](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html), "We recommend using groups rather than attaching policies directly to users."

## Create Policy

AWS Web Console -> `Security Credentials` -> `Policies` -> `Create Policy` -> `Create Your Own Policy`.

Follow the same pattern to create the `Policy Name` like `semaphore-policy-THE_DOMAIN_OF_YOUR_SITE`. In my case it is `semaphore-policy-willhaley.com`.

You may leave the `Description` blank, but enter the following information for the `Policy Document`.

Note, that date in the `Version` cannot be altered. It is not a customizable version number, but rather an AWS defined value.

Replace `willhaley.com` in the policy with the domain of your site.

```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"s3:GetBucketLocation",
				"s3:ListAllMyBuckets"
			],
			"Resource": "arn:aws:s3:::*"
		},
		{
			"Effect": "Allow",
			"Action": "s3:*",
			"Resource": [
				"arn:aws:s3:::willhaley.com",
				"arn:aws:s3:::willhaley.com/*"
			]
		}
	]
}
```

This policy allows a group to list all of the buckets to which it has access, which is required for Semaphore. It also grants full access to the bucket used for the site.

## Attach Policy to Group

AWS Web Console -> `Security Credentials` -> `Groups`. Click on the name of your group. In my case, it is `semaphore-group-willhaley.com`.

`Permissions` -> `Attach Policy`. Filter for the policy you just created it. In my case it is `semaphore-policy-willhaley.com`. Select it, and `Attach Policy`.

## Set Up Deployment in Semaphore

At this point, you should be able to [follow the Semaphore guide](https://semaphoreci.com/docs/deploying-to-amazon-s3.html) from the `Setting Up the Website` section.

Here is my abridged version of the process.

`Projects` -> Your Site -> `Severs (+)` -> `AWS S3` -> `Automatic` -> enter your `AWS Access Key ID` and `AWS Secret Access Key`. Select a region for your S3 bucket.

If deploying a jekyll blog (like I am) you can specify `public` as the `Content` to be deployed to S3.

That means that Semaphore will deploy only the generated files, and not the source code, which would be ideal.

Leave the `S3 Index Document` as `index.html` and select the `S3 Bucket`, which would be `willhaley.com` in my case.

`Name Your Server` with something meaningful. I feel like `S3` sums up the deployment method well enough.

Set the `Server URL (optional)` using the `Endpoint` found above in S3. In my case it is `http://willhaley.com.s3-website-us-east-1.amazonaws.com/`.

Finish the wizard to confirm these settings and initiate the first deployment.

## DNS

Depending on your configuration, you may need to switch hosting of your domain for your blog to Amazon's Route 53.

You should absolutely read and understand the [Example: Setting Up a Static Website Using a Custom Domain](https://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html) guide and the [Migrating DNS Service for an Existing Domain to Amazon Route 53](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html#Step_CreateHostedZone) guide.

The technical details behind your DNS hosting may vary greatly from mine, so I will not add any more information on this step, but feel free to contact me if you think I can be of assistance.
