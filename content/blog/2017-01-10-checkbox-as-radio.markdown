---
title: "Checkbox used as a Radio Button"
slug: checkbox-as-radio
date: 2017-01-10 20:45:03
---

This incorrect implementation caught my eye. This feels like a textbook situation where the wrong semantic element was used.

![bad-checkbox.gif](/images/checkbox-as-radio/bad-checkbox.gif)

These checkboxes cannot be unchecked, and are mutually exclusive. Clearly, they would be better off as radios.

The fact that hovering over the text causes the background to animate, but is not clickable, is also weird.
