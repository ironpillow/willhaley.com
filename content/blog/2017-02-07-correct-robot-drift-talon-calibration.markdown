---
title: "Correct FRC Robot Drift With Talon Calibration"
slug: correct-robot-drift-talon-calibration
date: 2017-02-07 22:06:00
---

We found that the robot our team is building for the FRC 2017 competition seems to favor one side. It lists on the X axis to the left when we try to simply go straight forward or back.

This tendency to lean and favor an axis was confusing us for a while. We thought it could be a software issue related to the drive train, an issue with our logitech joystick controller, or an electrical problem. We thought it could be a weight distribution issue as well, or possibly something wrong with the physical drive train or alignment.

We were afraid we might have to add an offset to the software to compensate.

Eventually, a team member found [this article](http://files.andymark.com/Talon_User_Manual_1_3.pdf) from AndyMark regarding calibration of the Talons for our motors. Page 7 of that document explains the calibration process.

> # Calibration
> The calibration procedure takes the minimum, maximum and center values of the PWM input signal and scales the output based on these values. Calibrating the Talon will allow full range of control with PWM signals that are not within the default range. Calibrating will also correct any non-center issues with input devices such as gamepads or joysticks.
>
> To calibrate the Talon:
>
> 1. Press and hold the button labeled "CAL" with a paper clip. The LED should begin to blink red/green.
> 2. Continue to keep the button pressed while moving the joystick full forward and full reverse. You may do this as many times as you like.
> 3. Center the joystick and then release the CAL button.
> 4. If calibration was successful, the LED will blink green several times. If the LED blinks red several times, the calibration was not valid. If this happens, the Talon will use the last valid
calibration values.
>
> All calibration values are retained after power cycle or reset.

After calibrating our Talons, the robot is no longer drifting direction to the left or right and is able to drive perfectly straight.
