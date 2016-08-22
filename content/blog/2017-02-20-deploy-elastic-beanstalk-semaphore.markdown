---
title: "Deploy to Elastic Beanstalk with Semaphore CI"
slug: deploy-elastic-beanstalk-semaphore
date: 2017-02-20 17:10:00
---

This process is really easy thanks to [Semaphore's guide](https://semaphoreci.com/docs/deploying-to-aws-elastic-beanstalk.html).

You can follow their directions just about to the letter, but here are some additional steps I like to follow regarding AWS roles and policies.

Create a group in IAM like `semaphore-group-eb` (eb for elastic beanstalk).

Don't add any policies to it. Don't add any users to it.

Click group details and note the id.

```
Group ARN: arn:aws:iam::SOME_ID:group/semaphore-group-eb
Users (in this group): 0
Path: /
Creation Time: 2017-01-21 20:17 CST
```

Note the id that appears where I have the `SOME_ID` placeholder.

Now "Create Your Own Policy". Copy and paste the policy from [Semaphore's guide](https://semaphoreci.com/docs/deploying-to-aws-elastic-beanstalk.html).

Click "Validate Policy". Note that the error says "This policy contains the following error: There are invalid ARNs in the policy. For more information about the IAM policy grammar, see AWS IAM Policies."

That error is because the policy contains some placeholder values.

Replace the `[region]` placeholder with your region, or `*` if you want the policy to be very permissive. In my case, I replace it with `us-east-1`.

Replace the `[user-or-group-id]` with the IAM id of the group we created above.

Your policy will also need these permissions if your Beanstalk environment is auto-scaling and has a load balancer. You may want to replace the `*` with more restrictive controls.

```
{
	"Effect": "Allow",
	"Action": [
		"elasticloadbalancing:RegisterInstancesWithLoadBalancer"
	],
	"Resource": [
		"arn:aws:elasticloadbalancing:*:*:*"
	]
},
```

Click "validate policy" and ensure the policy validates.

Name the policy something like `semaphore-policy-eb`.

Attach the policy to the group we created above.

We now have a group that contains all the permissions needed to deploy to Elastic Beanstalk via Semaphore. That group and policy provide a somewhat abstracted mechanism with the appropriate access.

Create an S3 bucket. In my case I'll create one named `app001-eb` (in reality you will probably want a descriptive name for your app and bucket).

Now we can create a user specific to our application. In my case, `semaphore-user-app001`.

After creating the user you should see an `AWS Access Key ID` and `AWS Secret Access Key`.

In Semaphore's Elastic Beanstalk deployment wizard, you can plug in your user's credentials and also select the S3 bucket you created.

I prefer to _not_ record the user credentials above. It is less hassle to delete the credentials and generate new ones for our deployment user rather than recording them and keeping them secret and safe.

Thanks to our group and policy, we can create a number of specific users like this that share the same policy for Semaphore eb deployments. Though, your security needs may vary. You may not want this generic permission mechanism and may want stricter access policies. Be sure to research what makes the most sense for you!
