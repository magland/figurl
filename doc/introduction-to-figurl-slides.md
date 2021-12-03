---
marp: true
---

# Introduction to Figurl

8 December 2021

Jeremy Magland and Jeff Soules
Center for Computational Mathematics, Flatiron Institute

---

# What is Figurl?

Figurl offers **shareable**, **interactive**, **computation-backed** views of scientific
datasets in the cloud.

* Share domain-specific views into potentially large and complex datasets
* View a data snapshot or evolving data
* Curate datasets
* Export figures backing data to stand-alone HTML bundles

---

# What is Figurl?

<img src="https://docs.google.com/drawings/d/e/2PACX-1vS2291R99JidHQd3AU9oa-DaIPXUgWUt7VW4WC872FrqeP0GQBYvhJccyZrBAiihZTVocl3JBO-AHuZ/pub?w=963&h=735" width=800>

---

# What is a FigURL?

A figURL = a permanent link to a data-backed figure

An example: https://www.figurl.org/f?v=gs://figurl/spikesortingview-1&d=79f878acca63c2527d2e5d99189852047b5af2c2&channel=flatiron1&label=despereaux20191125

Broken down:
* Figurl website: `https://www.figurl.org/f`
* View component: `v=gs://figurl/spikesortingview-1`
* Data object: `d=79f878acca63c2527d2e5d99189852047b5af2c2`
* Kachery channel to find the data: `channel=flatiron1`
* Label for display purposes: `label=despereaux20191125`

---

# Visualization component of figURL

<span>htt</span><span>ps://www.figurl.org/f?<span style="color:green">v=gs://figurl/spikesortingview-1</span> &d=79f878acca63c2527d2e5d99189852047b5af2c2&channel=flatiron1&label=despereaux20191125</span>

* Points to the visualization code somewhere on the internet
* General-purpose visualization provided by figurl
* Custom view specific to dataset

---

# Data component of figURL

<span>htt</span><span>ps://www.figurl.org/f?v=gs://figurl/spikesortingview-1 &<span style="color:green">d=79f878acca63c2527d2e5d99189852047b5af2c2</span> &channel=flatiron1&label=despereaux20191125</span>

Hash of data object stored in kachery

---

# Figurl generates shareable figures

"Shareable" means that you can send a link to a friend. You'll both see the same thing.

For example, [this link](https://www.figurl.org/f?v=gs://figurl/vegalite-1&d=f772ea09ce29e4046366cd24cbad069b001c06ce&channel=flatiron1&label=Example%20Altair%20plot) should load the following on any browser:
<img src=https://user-images.githubusercontent.com/3679296/144634803-d5f9d79f-e1cb-4ffb-9f75-384a17d786f6.png height="400px">

---

# Example: Generating a basic figure using Altair

```python
import altair as alt
import numpy as np
import pandas as pd
import figurl as fig

# This script is adapted from an example on the Altair website
n = 1000
x = np.arange(n) / n
source = pd.DataFrame({
    'x': x,
    'f(x)': np.sin(2 * np.pi * 12 * x ** 2) * x
})

# Create the Altair chart
chart = alt.Chart(source).mark_line().encode(
    x='x',
    y='f(x)'
)

# if running in a Jupyter notebook, the following
# line will also display the chart locally:
# display(chart)

# generates and prints the figURL permalink:
url = fig.Altair(chart).url(label='Example Altair plot')
print(url)
```

---

# Example: Vector Field Explorer

<img src="https://user-images.githubusercontent.com/3679296/144638006-3a839c0c-bfab-4732-a419-1a2cf3702d3c.png" width=70% height=70%>

[Vector field](https://www.figurl.org/f?v=gs://figurl/volumeview-2&d=48530916122545e6afeaf84645e7e13ea4651791&channel=flatiron1&label=Test%20vector%20field%20view)

---

# Example: Composite view - spike sorting

<img src="https://user-images.githubusercontent.com/3679296/144639565-46c16c52-dc4a-4c7f-80fd-b409900ac771.png" width=70% height=70%>

[Spike sorting view](https://www.figurl.org/f?v=gs://figurl/spikesortingview-1&d=79f878acca63c2527d2e5d99189852047b5af2c2&channel=flatiron1&label=despereaux20191125)

---

# Figures can load data dynamically when needed

Within Figurl, we make a distinction between "static" and "live" figures.

* **Static figures** are backed by data whose size is small enough that it
can be completely precomputed and cached when the figure is generated. Data are served directly from cloud storage cache, whether or not the original source is online.

* **Live** figures are backed by data that cannot be computed exhaustively in advance. The main examples are data streams and large datasets.

---

# Example: updating from an ongoing process

<img src="https://user-images.githubusercontent.com/3679296/144640541-a0ab47c3-79aa-4376-b2e3-46111567a084.png" width=70% height=70%>

[MCMC monitor view](https://www.figurl.org/f?v=gs://figurl/mcmc-monitor-1&d=9bebdacf6b9cfc2c7f62ea47a804bf875016549b&channel=flatiron1&label=multi-normal-example)

---

# Example: large data source

<img src="https://user-images.githubusercontent.com/3679296/144640895-75d7314e-2256-4c67-9222-7af49b4d545f.png" width=500px>

[Cross-correlograms view](https://www.figurl.org/f?v=gs://figurl/spikesortingview-1&d=79f878acca63c2527d2e5d99189852047b5af2c2&channel=flatiron1&label=despereaux20191125)

---

# Example: Curation of underlying datasets

<img src="https://user-images.githubusercontent.com/3679296/144641383-80e317c5-87a1-4eb8-80ef-532d6e1a4fcf.png">

---

# Role of kachery

<img src="https://docs.google.com/drawings/d/e/2PACX-1vQUnokzwrFHdIO-LjloBjHGbOHE7uaLEh9frzx-WrJbn_z0lIScFhyNWCBYZfj6ofjNHRoJbzjJbFlS/pub?w=960&h=720" width=70%>

---

# Distributing the visualization module code

* Visualizations are written in Javascript (we highly the [React framework](https://reactjs.org/)).
* We offer an expanding array of basic components
* Visualization code must be made available at a public location (the `v` parameter of the FigURL).
* The Figurl web application loads the JavaScript code in the
view component into an iframe, and feeds it the associated data so that it can
render the view.
* Cloud storage works well for this purpose

---

# Versioning visualization modules

* Creators of custom views should version visualization modules, leaving older versions of code accessible
* Allows older FigURLs to continue working as expected.
* Making viewer code accessible at a stable storage location is essential
to ensure visualizations remain accessible long into the future

---

# Future-proofing visualizations

* Figurl offers an 'export' feature for static figures
* All visualization code plus necessary data is automatically wrapped in an HTML bundle
* Downloaded as a .zip file (no external dependencies)

---

# Getting started

[Step-by-step example of getting started with Figurl.](https://github.com/magland/figurl/wiki/Getting-Started-with-Figurl)