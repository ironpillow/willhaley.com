---
title: "Private and Public Visibility with Go Packages"
slug: private-and-public-visibility-with-go-packages
date: 2016-12-02 19:09:26
---

I knew that [naming](https://golang.org/doc/effective_go.html#names), specifically as it relates to capitalization, was how we control exports in Golang.

It was not until I was using the language for a couple weeks that I realized the implications behind this.

Exports in Go, which are controlled by naming conventions, are very similar to the concepts of `public` and `private` we see in other languages.

```
package abc

// This will be exported. It is essentially public to other packages that
// import package abc. All because it is uppercased!
type Something1 struct {}

// This will not be exported. It is essentially private and inaccessible to
// packages that import package abc. All because it is lowercased!
type something2 struct {}
```

<!-- more -->

Since a capital letter means something will be exported, and a lowercase letter means it will not be exported, we can have structs and other data, functions, and methods, that are private in the scope of a package.

I think it is important to note that there is different semantic meaning behind exports in Go vs `public` and `private` in a language like Java. They may seem similar, but are definitely different concepts. However, using familiar terms like that helped me understand their power in Go.

It helped me think of the different patterns we can apply in packages

See an example (using a couple files) below.

I have a `cars` package used in this `main.go` file. By controlling the visibility inside the `cars` package, we can encourage patterns like having a constructor helper function for instantiating new structs. This way, we can hide the ability to create a struct literal and control the instantiation.

```
// main.go
package main

import (
	"./cars"

	"fmt"
)

func main() {
	// This will not work, because car is not exported from cars.go. The car
	// struct is lowercase. main.go cannot instantiate a literal car struct.
	// var car *cars.car
	// car = &cars.car{}

	// This works great. We export the NewCar method to create a constructor
	// for car structs. The car struct remains encapsulated in the package.
	car := cars.NewCar()

	// We can call this method just fine since it is exported.
	car.HonkTheHorn()

	// Attempting to call this method would produce an error since it is not
	// exported in the cars package.
	// car.secretHonk()

	// This works because Wheels is uppercased and exported.
	fmt.Println(car.Wheels)

	// This will not work because speed is lowercased and not exported.
	// fmt.Println(car.speed)
}

// This will not work since cars.car is not exported.
// func doThing1(car *cars.car) {
// 	// Do something.
// }

// This will work if we rely on a generic interface.
func doThing2(car *interface{}) {
	// Do something.
}
```

Here is the cars package used by main.

```
// cars/cars.go
package cars

import (
	"fmt"
)

// This struct is lowercased. Packages that import `cars` will not be able
// to instantiate a literal car.
type car struct {
	// This will not be exported.
	speed int
	// This will be exported.
	Wheels int
}

// This func is uppercased. Packages that import `cars` can instantiate a
// new car using this method. This allows us more control around car creation.
func NewCar() car {
	return car{}
}

// Lowercased method name. It is not visible outside this package.
func (car car) secretHonk() {
	fmt.Println("Shhh! h o n k  h o n k")
}

// Uppercased method name. It is visible outside this package.
func (car car) HonkTheHorn() {
	car.secretHonk()

	fmt.Println("HONK HONK! I am a car!")
}
```

This begged an interesting question for me. If `car` is not exported, how can it be used in `main.go`? How does `main.go` understand what a `car` can do?

I experimented by trying to re-define how we handle the result of the `NewCar` call.

```
// main.go
var car *cars.car
car = cars.NewCar()
```

That returns the following error.

```
./main.go:11: cannot refer to unexported name cars.car
```

This seems odd. How can `main.go` instantiate a car if it cannot use the unexported `cars.car`?

How does this work at all?

```
car := cars.NewCar()
```

I do not really have an answer to that. I can only assume that because exported methods like `HonkTheHorn` exist, we don't _need_ to have access to `cars.car` in order to call methods against it.

It is interesting to note the following behavior.

```
// main.go

// This will not work since cars.car is not exported.
// func doThing1(car *cars.car) {
// 	// Do something.
// }

// This will work since we rely on a generic interface.
func doThing2(car *interface{}) {
	// Do something.
}
```

If we uncomment `doThing1` we get a compile error because, again, `cars.car` is not exported.

So by keeping the `car` struct unexported we can call exported (public-esque) methods on it, but that's about it.

It is also interesting to note these cases.

```
// main.go

// This works because Wheels is uppercased and exported.
fmt.Println(car.Wheels)

// This will not work because speed is lowercased and not exported.
// fmt.Println(car.speed)
```

Although `car` is not exported, it can have fields that are exported.

My simple observation is that you can use whatever is exported, and everything else is blackbox to importing packages.

Not a very technical conclusion, but I think that basically sums it up, and the way that functionality is enforced in Go does seem pretty sensible and logical to me.
