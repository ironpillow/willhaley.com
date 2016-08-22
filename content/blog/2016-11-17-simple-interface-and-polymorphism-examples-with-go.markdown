---
title: "Simple Interface and Polymorphism Examples with Go"
slug: simple-interface-and-polymorphism-examples-with-go
date: 2016-11-17 19:03:11
---

Here is a quick demo of polymorphism via interfaces in golang. I am writing this up as a note-to-self, but maybe it will help others.

```
package main

import (
	"fmt"
)

// This is the interface. Types that wish to confirm to Vehicle must implement
// this interface. Implementing this interface is done by implementing the
// methods defined here. `description()` and `medium()`.
type Vehicle interface {
	description() string
	medium() string
}

// This is a simple struct type.
type Car struct {
	doors int
}

// This is a simple struct type.
type Boat struct {
	rudders int
	masts int
}

// By implementing this interface method, Car is starting to conform to the
// Vehicle interface.
func (c Car) description() string {
	return fmt.Sprintf("I am a car with %v door(s). I move on the %v.", c.doors, c.medium())
}

// By implementing this interface method, Car now completely conforms to the
// Vehicle interface.
func (c Car) medium() string {
	return "road"
}

// By implementing this interface method, Boat is starting to conform to the
// Vehicle interface.
func (b Boat) description() string {
	return fmt.Sprintf("I am a boat with %v rudder(s) and %v mast(s). I ride on %v.", b.rudders, b.masts, b.medium())
}

// By implementing this interface method, Boat now completely conforms to the
// Vehicle interface.
func (b Boat) medium() string {
	return "water"
}

// Note that an interface can either be a value-type or a reference-type, so
// we use `Vehicle` here, not `*Vehicle`.
// See http://openmymind.net/Things-I-Wish-Someone-Had-Told-Me-About-Go/
func ride(vehicle Vehicle) {
	fmt.Println(fmt.Sprintf("Literal Vehicle: Value is %v. Type is %T.", vehicle, vehicle))
	fmt.Println(vehicle.description())
	fmt.Println(fmt.Sprintf("Did you notice that the vehicle rides on %v?", vehicle.medium()))
}

// Type checking for a vehicle.
func checkType(vehicle Vehicle) {
	test1, ok1 := vehicle.(*Car)

	fmt.Println(fmt.Sprintf("Is %v a *Car? %v.", test1, ok1))

	test2, ok2 := vehicle.(Car)

	fmt.Println(fmt.Sprintf("Is %v a Car? %v.", test2, ok2))

	test3, ok1 := vehicle.(*Boat)

	fmt.Println(fmt.Sprintf("Is %v a *Boat? %v.", test3, ok1))

	test4, ok2 := vehicle.(Boat)

	fmt.Println(fmt.Sprintf("Is %v a Boat? %v.", test4, ok2))

	test5, ok3 := vehicle.(Vehicle)

	fmt.Println(fmt.Sprintf("Is %v a Vehicle? %v.", test5, ok3))
}

func main() {
	// Using & returns a pointer to the struct value.
	car := &Car{
		doors: 4,
	}

	// Not using & returns the struct value.
	boat := Boat{
		rudders: 1,
		masts: 3,
	}

	fmt.Println("Ride in the car!")
	ride(car)
	fmt.Println()

	fmt.Println("Ride in the boat!")
	ride(boat)
	fmt.Println()

	fmt.Println("Check the type of the car.")
	checkType(car)
	fmt.Println()

	fmt.Println("Check the type of the boat.")
	checkType(boat)
	fmt.Println()
}
```

Here is the output from running the above code. Note the `*` on `*main.Car` as opposed to `main.Boat`. That is because one uses `&` when defining the struct literal while the other does not. The `&` returns a pointer to the struct value as opposed to the value.

```
Ride in the car!
Literal Vehicle: Value is &{4}. Type is *main.Car.
I am a car with 4 door(s). I move on the road.
Did you notice that the vehicle rides on road?

Ride in the boat!
Literal Vehicle: Value is {1 3}. Type is main.Boat.
I am a boat with 1 rudder(s) and 3 mast(s). I ride on water.
Did you notice that the vehicle rides on water?

Check the type of the car.
Is &{4} a *Car? true.
Is {0} a Car? false.
Is <nil> a *Boat? false.
Is {0 0} a Boat? false.
Is &{4} a Vehicle? true.

Check the type of the boat.
Is <nil> a *Car? false.
Is {0} a Car? false.
Is <nil> a *Boat? false.
Is {1 3} a Boat? true.
Is {1 3} a Vehicle? true.
```

[This article explaining references](http://openmymind.net/Things-I-Wish-Someone-Had-Told-Me-About-Go/) was very helpful to me in creating this demo for myself.

The same goes for [this polymorphism example from the Go Playground](https://play.golang.org/p/313UebA3rD) and this [example about struct literals](https://tour.golang.org/moretypes/5). The Go Tour is a great source of information, especially [this section on interfaces](https://tour.golang.org/methods/10) as it relates to my article.
