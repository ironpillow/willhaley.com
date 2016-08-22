---
title: "Use Cookies With Curl"
slug: use-cookies-with-curl
date: 2016-12-17 10:54:29
---

```
#!/usr/bin/env bash

curl \
    -vv \
    --cookie cookies.txt \
    --cookie-jar cookies.txt \
    http://localhost/login \
    -d '{
        "email": "user@whatever.com", "password": "password"
    }'
```

If you are finding that the `cookies.txt` file is not being generated or is empty, then look at the output from `curl`.

We're using verbose flags (`-vv`) so you _should_ see something like this.

```
* Added cookie some_cookie="Some+cookie" for domain localhost, path /, expire 0
< Set-Cookie: some_cookie=Some+cookie; path=/; domain=localhost; secure
```

If you see any errors or no cookies being sent, then the issue is probably that the server is not sending cookies properly.
