---
title: "Serializing Array Values In URLs For Golang"
date: 2018-01-03 17:51:00
---

First, here is a quick (and non-exhaustive) primer on escaping values for URIs so that they can be properly utilized as part of our HTTP query string params. We escape values in a URI to [conform to standards](https://www.ietf.org/rfc/rfc3986.txt).

A URI with a query string like `/someroute?key=hello there` is invalid because of the space between `hello` and `there`. Spaces cannot exist in the URI search value. The same goes for a number of other characters.

We can use `encodeURIComponent` in Javascript to **escape** these invalid URI characters. A similar sort of encode function should exist in just about any modern programming language you may use.

```
$ encodeURIComponent('hello there')
"hello%20there"
```

`hello%20there` represents `hello there`, conforms to standards, and can be used in a valid URI.

You can read more about [URI encoding on the MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent). There are fine points to the encoding and the standards have progressed over time. For example, there's an [interesting read here on using `+` vs `%20` for spaces in different situations](https://stackoverflow.com/questions/1634271/url-encoding-the-space-character-or-20).

Primitive value encoding is fairly well standardized, but what about a complex structure like an array? Arrays of values in URI parameters pose an interesting problem. [jQuery](http://api.jquery.com/jquery.param/) has some concise notes on the topic of serializing array values into a query string.

> Note: Because there is no universally agreed-upon specification for param strings, it is not possible to encode complex data structures using this method in a manner that works ideally across all languages supporting such input. Use JSON format as an alternative for encoding complex data instead.

It seems there are at least a couple common approaches for handling this sort of data in a URI.

_Please note that I am **not** suggesting these are the ideal ways of serializing arrays. I am simply trying to show different methods and why they may differ._

**1) Encoded JSON Serialization**

In this case we serialize the array as a JSON string. The string is a marshalled represenation of the array that can be parsed out later as a JSON data type. I am using `encodeURIComponent` to escape invalid characters from our `JSON.stringify` call.

```
> `array=${encodeURIComponent(JSON.stringify([1,2,3,4]))}`
array=%5B1%2C2%2C3%2C4%5D
```

**2) Encode Each Value Using The Same Key**

In this case we use jQuery (not required, but as a convenience) to encode the array like so in the URL. `/path?array[]=1&array[]=2&array[]=3&array[]=4`. In this case we do not have one `array=` value in the query string. Instead, each member is a separate parameter and grouped together with the convention of `array[]=`. In this case, `param()` automatically encodes the values so that `array[]=` is translated to `array%5B%5D=`.

```
> $.param({array: [1,2,3,4]})
array%5B%5D=1&array%5B%5D=2&array%5B%5D=3&array%5B%5D=4
```

We can do the same thing as above and drop the `[]` from `array[]` if we would like. It seems there's no real impact to which method you choose. As was stated above, there is no standard for this. In that case the URI would look like `/path?array=1&array=2&array=3&array=4`. Note that we are not using the `[]` brackets in the param names this time, as opposed to the method above. We simply repeat the key in the URI. In this case, I am not doing any encoding since these characters do not require encoding.

```
> [1,2,3,4].map(x => `array=${x}`).join('&')
array=1&array=2&array=3&array=4
```

# What Works Best For Golang?

Why might we use one of those encoding methods over another? Since there is no real standard around handling arrays like this, I would say it varies based on your use cases, personal preferences, frameworks, and environments. Though, I would argue that it's worth seeing how the existing major frameworks behave, and that consistency is probably key over anything else. Treating your array values differently in different parts of the same program would probably be very confusing.

As it relates to Golang, it appears that using the `key=value1&key=value2` pattern may be desirable. I say that because of [this Go Playground Example](https://golang.org/pkg/net/url/#example_Values) linked from the official Go docs, which illustrates how [Golang encodes URI Values](https://golang.org/pkg/net/url/#example_Values).

```
v := url.Values{}
v.Add("friend", "Jess")
v.Add("friend", "Sarah")
v.Add("friend", "Zoe")
// v.Encode() == "friend=Jess&friend=Sarah&friend=Zoe"
```

Note that Golang says this "maps a string key to a list of values". So they may not think of it as an array as much as a repeat occurence of a key. A key with multiple values. However, the effect is essentially the same as thinking of it as a slice.

There does not seem to be any prescriptive way in Golang to "encode an array", but this is probably the closest indication of preferred style. **Obviously, you can do whatever works best for your environment**. Google has [an interesting library, go-querystring, which may also be handy for this problem](https://github.com/google/go-querystring).

There are some pros and cons to the `key=value1&key=value2` pattern.

The `url.ParseQuery` method naturally extracts that URI structure as a map.

```
package main

import (
	"fmt"
	"net/url"
)

func main() {
	m, _ := url.ParseQuery(`array=10&array=11`)
	fmt.Println(m["array"][0], m["array"][1])
}
```

Outputs

```
$ 10 11
```

It should be noted that the same is true for the similary `key[]=value1&key[]=value2` syntax. Here Go parses it to a map just as easily when we pass in the encoded string.

```
package main

import (
	"fmt"
	"net/url"
)

func main() {
	m, _ := url.ParseQuery(`array%5B%5D=20&array%5B%5D=22`)
	fmt.Println(m["array[]"][0], m["array[]"][1])
}
```

Outputs

```
$ 20 22
```

However, there is a definitely a letdown to this format. All the values are coerced to strings, and we must loop over every value to convert them to ints if we want. Not the end of the world, but definitely a bit of a pain.

```
package main

import (
	"fmt"
	"net/url"
	"strconv"
)

func main() {
	m, _ := url.ParseQuery(`array=100&array=200`)

	ids := make([]int64, len(m["array"]))
	for i, v := range m["array"] {
	  ids[i], _ = strconv.ParseInt(v, 10, 64)
	  ids[i] = ids[i] * 200
	}

	fmt.Println(ids)
}
```

Outputs

```
[20000 40000]
```

That's a bit verbose, but not too terrible. Another take on this would be to use the first described method in which we encode the entire array as stringified JSON.

This has a few conveniences. Coercing the data to the expected type is easy. We can immediately unserialize to `int64` values in this case, and we also have the benefit of using the `Get()` helper on the `Values` map since this is no longer an array of numbers, but rather a stringified representation of the array. `Get()` behaves a bit strangely in my opinion when dealing with arrays, and only returns the first value.

```
package main

import (
	"fmt"
	"net/url"
	"encoding/json"
)

func main() {
	m, _ := url.ParseQuery(`array=%5B1%2C2%2C3%2C4%5D`)

	var ids []int64
	json.Unmarshal([]byte(m.Get("array")), &ids)

	fmt.Println(ids)
}
```

Outputs

```
[1 2 3 4]
```

Definitely a lot of options, and I think there are pros and cons to the various approaches. I think the ultimate goal should be consistency. Standardize on one approach so that it is easy to migrate in the future if the community moves to a different standard.
