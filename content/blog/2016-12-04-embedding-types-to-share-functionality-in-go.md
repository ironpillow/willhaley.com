---
title: "Embedding Types To Share Functionality In Go"
slug: embedding-types-to-share-functionality-in-go
date: 2016-12-02 19:09:26
---

Use [embedding](https://golang.org/doc/effective_go.html#embedding) to share functionality between types in Go.

Both `car` and `boat` embed the type `vehicle`. Because they do that, they get access to the method `move` on `vehicle` automatically. Pretty nice!

As stated in the golang docs:

> Go does not provide the typical, type-driven notion of subclassing, but it does have the ability to “borrow” pieces of an implementation by embedding types within a struct or interface.

This is similar to subclassing as you might be familiar with it in other languages. Neither `boat` nor `car` are classes, but the abilities gained by embedding are very similar.

```
package main

import (
	"fmt"
)

func main() {
	car := &car{}
	car.move()

	boat := &boat{}
	boat.move()
}

type vehicle struct {
}

func (v vehicle) move() {
	fmt.Println("I am a vehicle! I move!")
}

type car struct {
	vehicle
	wheels int
}

type boat struct {
	vehicle
	rudders int
}

// With this commented out, invoking car.move() will call the method
// `func (v vehicle) move() {}` instead.
// func (c car) move() {
// 	fmt.Println("I am a car! I drive!")
// }

func (b boat) move() {
	fmt.Println("I am a boat! I sail!")
}
```

This produces the following output.

```
I am a vehicle! I move!
I am a boat! I sail!
```
