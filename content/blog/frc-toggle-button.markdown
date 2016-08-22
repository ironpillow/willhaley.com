---
title: "FRC Joystick Toggle Button In Java"
date: 2018-02-08 01:53:00
---

Let's compare two different types of buttons.

Imagine you want to have a button that fires a laser.

It may make sense that the laser fires only when the button is held down (pressed). So you could press the button for 1 second, 10 seconds, a minute, and the laser would fire in a sustained beam for as long as you held the button.

```
hold button -> 1 second -> 2 seconds -> 3 seconds STOP
pew->pew->pew->pew->pew->pew->pew->pew->pew->pew- STOP
```

Now image we have a button that should open or close a door.

If we hold the button down for 3 seconds, we don't want it to toggle the door open and closed continuously for 3 seconds, right? The door would flap open and closed like it was haunted! Not very helpful behavior.

```
hold button -> 1 second -> 2 seconds -> 3 seconds STOP
open->close->open->close->open->close->open->clos STOP
```

For the sake of our door, we probably want our button to _toggle_ the door being open instead. **Holding** the button for our door should behave no differently than **pressing** the button for our door. The length of time should not matter.

In this case, our button would **essentially be a switch**. It's either on or off.

That way, no matter whether you hold the button for 0.1 seconds or 100 seconds, the door only swings once until the next time the button is pressed (toggled).

```
hold button -> 1 second -> 2 seconds -> 3 seconds
open

hold button -> 1 second -> 2 seconds -> 3 seconds
close
```

# Can we use `getRawButton()` to solve this?

Short answer, **no**. Long answer, it's complicated and there are better ways.

It may be tempting to do something like this in the `while` loop of the `operatorControl()` method if you're using a `SampleRobot` base class or the `robotPeriodic()` func if you're using an `IterativeRobot` base class. _As an aside, you should NOT be using the `SampleRobot` class!_

```
while ... {
    // Get whether or not button 3 is pressed.
    if (stick.getRawButton(3)) {
        System.out.println("Button 3 is pressed!");
    }
}
```

That method call above to `getRawButton()` _does_ get the value you want, but there's an issue.

If you, a human, only press the button for 0.1 seconds, that `while` loop can execute dozens of times in that fraction of a second! The while `loop` execution is _faster_ than your finger. Even though you may think, "I only lightly pressed it really quickly. I didn't hold it down!", the code disagrees. What seems like a short time to you is actually a very long time to a fast bit of code like this.

Even pressing the button for a fraction of a second would cause the opening / closing door problem from above. We don't want that! We want our button to behave like a switch.

Here's an example from my machine at home. This is the console output from Eclipse. I ran some code using a simulator. I tapped a button on a joystick and let go of the button as fast as I could, and that code still ran 4 times. This is not an ideal way to read and toggle a value.

```
[java] Button 3 is pressed!
[java] Button 3 is pressed!
[java] Button 3 is pressed!
[java] Button 3 is pressed!
```

# Can we use `stick.getRawButtonPressed()`?

If you're using the latest Eclipse plugin (`v2018.2.2` at time of writing), then sure! In this case [getRawButtonPressed()](http://first.wpi.edu/FRC/roborio/release/docs/java/edu/wpi/first/wpilibj/GenericHID.html#getRawButtonPressed-int-) is an **ideal** API to use!

> **public boolean getRawButtonPressed(int button)**
>
> Whether the button was pressed **since the last check**. Button indexes begin at 1.

"Since the last check" is crucial here. `getRawButtonPressed()` is doing the hard work for us. It will make sure that we can treat the presses like toggles, and that holding down on the button for a given length of time makes no difference.

```
// See if button number 3 was pressed.
if (stick.getRawButtonPressed(3)) {
    // Every time the button is pressed, flip the
    // value of someBoolean.
    someBoolean = !someBoolean;
}
```

# Using the `Command` API

The [InstantCommand](http://first.wpi.edu/FRC/roborio/release/docs/java/edu/wpi/first/wpilibj/command/InstantCommand.html) class is also ideal for this sort of problem. Especially if you are using an older version of the FRC libraries and do not have access to the `getRawButtonPressed()` API.

Add this code inside the `robotInit()` method. This allows us to define a JoystickButton object which gives us a much friendlier interface than getting the raw joystick input.

```
public void robotInit() {
  ... existing code ...

  // Create a JoystickButton for button number 3.
  JoystickButton toggleButton = new JoystickButton(stick, 3);

  // This code will fire **once** every time the button is pressed.
  toggleButton.whenPressed(new InstantCommand() {
    @Override
    protected void execute() {
        // Flip the value of someBoolean.
        someBoolean = !someBoolean;
        System.out.println("someBoolean: " + someBoolean);
    }
  });
}
```

You'll need to define that `someBoolean` boolean at the top of the class so that it's in scope and can be used elsewhere.

```
public class Robot extends SampleRobot {
    ... existing code ...
    boolean someBoolean = false;
    ... existing code ...
}
```

And then add this line to the while loop if using a `SampleRobot` (_Which, again, you should not be using_).

```
while ... existing code ... {
   // This makes sure commands are run (if needed)
   // every time the execution loop runs.
   Scheduler.getInstance().run();

   ... existing code ...
}
```

Or if using an `IterativeRobot` base class you can use the `teleopPeriodic()` method.

```
public void teleopPeriodic() {
    // This makes sure commands are run (if needed)
    // every time the execution loop runs.
    Scheduler.getInstance().run();
}
```

# Other options

You may find other implementations for handling a toggle button. If your answer works reliably like you need, then go for it!

I am trying to offer some approaches that may help, but these are not necessarily the best or only ways to get toggling behavior from a button.
