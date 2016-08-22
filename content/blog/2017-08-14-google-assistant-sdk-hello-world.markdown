---
title: "Google Assistant SDK Hello World"
slug: google-assistant-sdk-hello-world
date: 2017-08-14 00:00:00
---

It is relatively simple to get started with the Google Assistant SDK. An [Instructable about a Raspberry Pi Google Assistant](http://www.instructables.com/id/Raspberry-Pi-DIY-Google-Assistant-With-Sleek-Wood-/?utm_source=newsletter&utm_medium=email) is what first piqued my interest about trying the Google Assistant SDK.

<!-- more -->

# Requisites

Before doing anything else, make sure your microphone works. I insist you do this first to avoid wasting time later.

You may use a program like Google Hangouts or [an online microphone test program](https://www.onlinemictest.com/) to verify your microphone is being properly detected.

You should also verify your speakers are working properly.

# SDK Project

You may [follow Google's guide](https://developers.google.com/assistant/sdk/develop/python/config-dev-project-and-account) to create a Google Assistant project, or follow the steps provided here.

[Go to the projects page](https://console.cloud.google.com/project) to create a project.

Click `CREATE PROJECT` and specify a name. In my case I entered `Google Assistant Test`. Create your project.

The UI will **not** display your project immediately. Notice the bell-shaped notification icon in the upper right hand corner of the screen. That icon will indicate when your project has been created. Click the appropriate link to view your project details after it has been created.

Once your project is created, navigate to the [enable the API](https://console.developers.google.com/apis/api/embeddedassistant.googleapis.com/overview) page and then click the `ENABLE` button. You may need to refresh multiple times before you see the API has been enabled.

Create an [OAuth client id](https://console.developers.google.com/apis/credentials/oauthclient) for your project. You may need to configure the `consent screen` before you are able to generate credentials.

You can specify `other` as the `Application Type` for the credentials and specify something like `Test Server` in the input box.

After creating the credentials, view the list of all your credentials. You may need to refresh the page to view your newly created credentials. Click the download icon to download the credentials as a `json` file.

# Application

You may [follow Google's basic sample Python guide](https://developers.google.com/assistant/sdk/develop/python/run-sample) for using the Google Assistant SDK, or follow those same steps here.

Create a python virtual environment.

```
python3 -m venv env
```

Update `setuptools` in that virtual environment.

```
env/bin/python -m pip install --upgrade pip setuptools
```

Activate the virtual environment.

```
source env/bin/activate
```

<span class="warning">You should now be using the python virtual environment shell. That is where these next commands should be run</span>

Install the Google Assistant SDK.

```
python -m pip install --upgrade google-assistant-library
```

Install Google's OAuth library.

```
python -m pip install --upgrade google-auth-oauthlib[tool]
```

You **must** update the path below to reference **your** OAuth `json` file that we downloaded earlier.

```
google-oauthlib-tool \
	--client-secrets ./client_secret.json \
	--scope https://www.googleapis.com/auth/assistant-sdk-prototype \
	--save \
	--headless
```

The tool should print out a URL that you must open in order to authenticate. Open that URL in a browser and authenticate as a valid Google user.

After authenticating and agreeing to give your application the appropriate access, a code should be displayed in your browser.

Copy that code and paste it into the terminal where prompted to `Enter the authorization code:`.

Run the Google Assistant demo.

```
google-assistant-demo
```

You should be able to say "Ok, Google", and ask it something like, "What time is it?".

As long as your microphone is working, and your speakers are on, you should hear a response.

If the only response you receive is, "Actually, there are some basic settings that need your permission first", then you most likely have disabled certain permissions that are preventing Google Assistant from functioning properly.

In my case, I had to enable `Voice & Audio` and `Device Information` permissions in [Google's Activity controls](https://myaccount.google.com/activitycontrols?pli=1).

Refer to the [troubleshooting steps](https://developers.google.com/assistant/sdk/develop/python/troubleshooting#hotword) as needed.

A [more advanced sample application](https://github.com/googlesamples/assistant-sdk-python) can allow you to dig deeper into the Google Assistant SDK.

# Citations

* [Raspberry Pi Google Assistant With Sleek Wood Box](http://www.instructables.com/id/Raspberry-Pi-DIY-Google-Assistant-With-Sleek-Wood-/?utm_source=newsletter&utm_medium=email)
