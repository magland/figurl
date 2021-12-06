---
marp: true
---

# Introduction to Figurl

8 December 2021

Jeremy Magland and Jeff Soules
Center for Computational Mathematics, Flatiron Institute

---

# What is Figurl?

Figurl is a framework for making **shareable**, **interactive**, **computation-backed**
views of scientific datasets in the cloud.

Figurl allows users to:

* Share domain-specific views into potentially large and complex datasets
* View a data snapshot or evolving data
* Curate datasets
* Export figures (with backing data) to stand-alone HTML bundles

([Long-form introduction: https://github.com/magland/figurl/wiki/Introduction-to-Figurl](https://github.com/magland/figurl/wiki/Introduction-to-Figurl))

---

# What is Figurl?

<img src="https://docs.google.com/drawings/d/e/2PACX-1vS2291R99JidHQd3AU9oa-DaIPXUgWUt7VW4WC872FrqeP0GQBYvhJccyZrBAiihZTVocl3JBO-AHuZ/pub?w=963&h=735" width=800>

---

# What is a FigURL?

A figURL = a canonical link to a data-backed figure

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

# Vector Field Explorer Example Code

```python
import numpy as np
import volumeview as vv

a = np.zeros((3, 90, 60, 45), dtype=np.float32)
ix, iy, iz = np.meshgrid(*[np.linspace(-1, 1, n) for n in a.shape[1:]], indexing='ij')
a[0, :, :, :] = np.sin((ix + iy - iz) * 4 * np.pi) * np.exp(-3 * (ix**2 + iy**2 + iz**2))
a[1, :, :, :] = np.sin((iy + iz - ix) * 4 * np.pi) * np.exp(-3 * (ix**2 + iy**2 + iz**2))
a[2, :, :, :] = np.sin((ix + iz - iy) * 4 * np.pi) * np.exp(-3 * (ix**2 + iy**2 + iz**2))

F = vv.create_vector_field_view(a)
url = F.url(label='Test vector field view')
print(url)
```

As this code shows, the VolumeView visualizer can render arbitrary numpy array data.

---

# Example: Composite view - spike sorting

<img src="https://user-images.githubusercontent.com/3679296/144639565-46c16c52-dc4a-4c7f-80fd-b409900ac771.png" width=70% height=70%>

[Spike sorting view](https://www.figurl.org/f?v=gs://figurl/spikesortingview-1&d=79f878acca63c2527d2e5d99189852047b5af2c2&channel=flatiron1&label=despereaux20191125)

---

# Figures can load data dynamically when needed

Within Figurl, we make a distinction between "static" and "live" figures.

* **Static figures**:
  * Backed by data that can be completely precomputed and cached in advance
  * Data served directly from cloud storage cache (not the original source)

* **Live figures**:
  * Backing data is not computed or uploaded exhaustively in advance
  * Use cases: **data streams** and **large datasets**

---

# Example: updating from an ongoing process

<img src="https://user-images.githubusercontent.com/3679296/144640541-a0ab47c3-79aa-4376-b2e3-46111567a084.png" width=70% height=70%>

[MCMC monitor view](https://www.figurl.org/f?v=gs://figurl/mcmc-monitor-1&d=9bebdacf6b9cfc2c7f62ea47a804bf875016549b&channel=flatiron1&label=multi-normal-example)

---

# Example: large data source

<img src="https://user-images.githubusercontent.com/3679296/144640895-75d7314e-2256-4c67-9222-7af49b4d545f.png" width=500px>

[Cross-correlograms view](https://www.figurl.org/f?v=gs://figurl/spikesortingview-1&d=79f878acca63c2527d2e5d99189852047b5af2c2&channel=flatiron1&label=despereaux20191125)

---
# Data flow for live figures

<img src="https://camo.githubusercontent.com/9b0688592f01172e0ff092ff4b0b0f93239fb2d05b17c5c46d1055c4dbe1ea96/68747470733a2f2f646f63732e676f6f676c652e636f6d2f64726177696e67732f642f652f32504143582d3176516976524733457a494f486474476b6b667a756a43503746665f7361575a535a536d6745422d655f73597256447a31616e34515367567045696546514f634332654137703337366c394f4a4d2d322f7075623f773d36373526683d343534"
alt="Diagram of elements supporting a live figure." width="675" height="454">

---

# Example: Curation of underlying datasets

<img src="https://user-images.githubusercontent.com/3679296/144641383-80e317c5-87a1-4eb8-80ef-532d6e1a4fcf.png">

---

# Role of kachery

* *Mediated peer-to-peer* network for sharing scientific data
* Distributes the data objects that back Figurl figures
* Minimal barrier to entry for sharing data
* Canonical file locations for reliable consistent retrieval
* Cloud cache makes data access fast and reliable
* Supports **files** (static data) and **feeds** (append-only ledger in JSON)
* Provides access to other compute through **tasks**

---

# Distributing the visualization module code

* Visualizations written in Javascript (we highly recommend the [React framework](https://reactjs.org/))
* We offer an expanding array of basic components
* Visualization code must be available at a public location (FigURL `v` parameter)
* Cloud storage works well for this purpose
* The Figurl web application loads the view component code into an iframe, and passes the associated data to render

---

# Versioning visualization modules

* Creators of custom views should version visualization modules, leaving older versions of code accessible
* Allows older FigURLs to continue working as expected
* Making viewer code accessible at a stable storage location is essential
to ensure visualizations remain accessible long into the future

---

# Future-proofing visualizations

* Figurl offers an 'export' feature for static figures
* All visualization code + necessary data is wrapped in an HTML bundle
* Downloaded as a .zip file (no external dependencies)
* Live figures are not supported by this process

---

# Questions?

---

# Getting started

[Step-by-step example of getting started with Figurl](https://github.com/magland/figurl/wiki/Getting-Started-with-Figurl)

---

# More about kachery structure

<img src="https://docs.google.com/drawings/d/e/2PACX-1vQUnokzwrFHdIO-LjloBjHGbOHE7uaLEh9frzx-WrJbn_z0lIScFhyNWCBYZfj6ofjNHRoJbzjJbFlS/pub?w=960&h=720" width=70%>

