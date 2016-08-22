---
title: "Generate JWT With Bash"
date: 2016-12-17 10:54:29
date_modified: 2018-10-27 15:54:00
disqus: true
---

To assist in troubleshooting, I wanted to generate JWT (JSON Web Tokens) on-the-fly with bash.

It was the easiest way (I thought) to be able to test various conditions like malformed headers, payloads, mismatching algorithms, and various other edge cases to see how my server would respond.

This [nginx blog post](https://www.nginx.com/blog/authenticating-api-clients-jwt-nginx-plus/) and this [superuser post](https://superuser.com/questions/606953/bash-oauth-2-0-jwt-script-for-server-to-google-server-applications/607250) were very helpful in getting my script working.

For most people, you might find that the interactive debugger available at [jwt.io](http://jwt.io) is actually a much better way to generate JWTs. You can click that link and live edit either the generated token on the left, or the content on the right. It's very nice and simple.

However, since I already spent all this time and energy to do it in bash, I wanted to share my results.

Edit the `secret`, `header`, and `payload` variables in this script as needed.

You must have `jq`, `openssl`, and `base64` installed for this to work. The [jq syntax](https://stedolan.github.io/jq/manual/#Basicfilters) seemed a bit funky to me at first, so I avoided it. In retrospect, I have found it to be _very_ powerful, and I recommend you take the opportunity to [learn jq](https://stedolan.github.io/jq/manual/). Click the examples in [the manual](https://stedolan.github.io/jq/manual/) and play with jq online!

This will only generate JWTs with HMAC signing using SHA256. I've seen this signing referred to as both HS256 and HMACSHA256.

Thanks to [Charles Duffy's](https://stackoverflow.com/a/46672439/1459103) input for helping to drastically improve these scripts, and for [Frederick Berg's](https://twitter.com/FrederikBerg) help in highlighting that base64 URL encoding was required on the `base64` encoded output to make the values URL safe and compatible with [jwt.io](https://jwt.io).

```
#!/usr/bin/env bash

#
# JWT Encoder Bash Script
#

secret='SOME SECRET'

# Static header fields.
header='{
	"typ": "JWT",
	"alg": "HS256",
	"kid": "0001",
	"iss": "Bash JWT Generator"
}'

# Use jq to set the dynamic `iat` and `exp`
# fields on the header using the current time.
# `iat` is set to now, and `exp` is now + 1 second.
header=$(
	echo "${header}" | jq --arg time_str "$(date +%s)" \
	'
	($time_str | tonumber) as $time_num
	| .iat=$time_num
	| .exp=($time_num + 1)
	'
)
payload='{
	"Id": 1,
	"Name": "Hello, world!"
}'

base64_encode()
{
	declare input=${1:-$(</dev/stdin)}
	# Use `tr` to URL encode the output from base64.
	printf '%s' "${input}" | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n'
}

json() {
	declare input=${1:-$(</dev/stdin)}
	printf '%s' "${input}" | jq -c .
}

hmacsha256_sign()
{
	declare input=${1:-$(</dev/stdin)}
	printf '%s' "${input}" | openssl dgst -binary -sha256 -hmac "${secret}"
}

header_base64=$(echo "${header}" | json | base64_encode)
payload_base64=$(echo "${payload}" | json | base64_encode)

header_payload=$(echo "${header_base64}.${payload_base64}")
signature=$(echo "${header_payload}" | hmacsha256_sign | base64_encode)

echo "${header_payload}.${signature}"
```

Running the script should generate an encoded JWT that looks like this.

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjAwMDEiLCJpc3MiOiJCYXNoIEpXVCBHZW5lcmF0b3IiLCJleHAiOjE0ODE5OTQxMzgsImlhdCI6MTQ4MTk5NDEzN30.eyJJZCI6MSwiTmFtZSI6ImhleSB0aGVyZSJ9.VeREKJ8rj5UuGrKpK85-grqihFhlCkIJjte2XiFIZs8
```

You can use the [JWT Debugger](http://jwt.io) to verify the string is valid and properly signed.

You can also decode and verify the token using this script. Edit the `secret` variable as needed so that you can verify the JWT is properly signed.

Because we mangle the encoded base64 output with `tr` to remove certain characters, note below that when we decode the base64 string we have to go out of our way to add that [padding](https://en.wikipedia.org/wiki/Base64#Output_paddingg) back in.

```
#!/usr/bin/env bash

#
# JWT Decoder Bash Script
#

secret='SOME SECRET'

base64_encode()
{
	declare input=${1:-$(</dev/stdin)}
	# Use `tr` to URL encode the output from base64.
	printf '%s' "${input}" | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n'
}

base64_decode()
{
	declare input=${1:-$(</dev/stdin)}
	# A standard base64 string should always be `n % 4 == 0`. We made the base64
	# string URL safe when we created the JWT, which meant removing the `=`
	# signs that are there for padding. Now we must add them back to get the
	# proper length.
	remainder=$((${#input} % 4));
	if [ $remainder -eq 1 ];
	then
		>2& echo "fatal error. base64 string is unexepcted length"
	elif [[ $remainder -eq 2 || $remainder -eq 3 ]];
	then
		input="${input}$(for i in `seq $((4 - $remainder))`; do printf =; done)"
	fi
	printf '%s' "${input}" | base64 --decode
}

verify_signature()
{
	declare header_and_payload=${1}
	expected=$(echo "${header_and_payload}" | hmacsha256_encode | base64_encode)
	actual=${2}

	if [ "${expected}" = "${actual}" ]
	then
		echo "Signature is valid"
	else
		echo "Signature is NOT valid"
	fi
}

hmacsha256_encode()
{
	declare input=${1:-$(</dev/stdin)}
	printf '%s' "${input}" | openssl dgst -binary -sha256 -hmac "${secret}"
}

# Read the token from stdin
declare token=${1:-$(</dev/stdin)};

IFS='.' read -ra pieces <<< "$token"

declare header=${pieces[0]}
declare payload=${pieces[1]}
declare signature=${pieces[2]}

echo "Header"
echo "${header}" | base64_decode | jq
echo "Payload"
echo "${payload}" | base64_decode | jq

verify_signature "${header}.${payload}" "${signature}"
```
