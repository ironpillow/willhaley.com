---
title: "React United States Map"
date: 2019-07-02 21:52:00
---

Although [D3.js](https://d3js.org/) is a handy visualization tool, the goal of this project is to display a map of the US using SVG and React _without_ the need for D3.

One of the most crucial aspects of this map is a complex JSON file that describes the shape of every state. Using existing source data from bl.ocks.org user [Pasha](https://bl.ocks.org/NPashaP) as a template, I created my own [states.json file](/assets/united-states-map-react/states.json) which you are free to use as you like. This entire project is modeled on the [demo from Pasha](http://bl.ocks.org/NPashaP/a74faf20b492ad377312).

A very simple incarnation of a React SVG map of the U.S.A. could look like this.

```
{{% inline "/static/assets/united-states-map-react/App.jsx" %}}
```

I find that using React to manually generate SVG is far more readable and much simpler than the D3 jQuery-selector based API, but that's just me! Note that this is only using vanilla SVG and React, and there is plenty of room for customization with standard event handlers and JS. No other third party libraries required!

**Note: This demo is loaded with React DOM and is not optimized for performance. See page source for details**

<div id="demo"></div>

<script src="/js/react.development.js"></script>
<script src="/js/react-dom.development.js"></script>
<script src="/js/babel.min.js"></script>
<script type="text/babel" src="/assets/united-states-map-react/App.jsx"></script>
