<img src="./figurl.png" width="200px" />

# figurl

Create shareable, interactive, live figures on the distributed web using Python

See also [kachery-cloud](https://github.com/scratchrealm/kachery-cloud)

## Quick example

```python
# You'll first need to set up and configure kachery-cloud

# pip install altair vega_datasets

import figurl as fig

from vega_datasets import data
stocks = data.stocks()

import altair as alt
x = alt.Chart(stocks).mark_line().encode(
  x='date:T',
  y='price',
  color='symbol'
).interactive(bind_y=False)

url = fig.Altair(x).url(label='scatter')
print(url)

# Output: 
# https://figurl.org/f?v=gs://figurl/vegalite-1&d=ipfs://bafkreierzdetqnlhxfczsz6zqg6psvjobzqidtgmhmf7a4z27gjkml32xq&label=scatter
```

[Resulting scatter plot](https://figurl.org/f?v=gs://figurl/vegalite-1&d=ipfs://bafkreierzdetqnlhxfczsz6zqg6psvjobzqidtgmhmf7a4z27gjkml32xq&label=scatter) with data stored in [Filebase](https://filebase.com/) and pinned on [IPFS](https://ipfs.io/). 

## Introduction

[Introduction to Figurl](https://github.com/magland/figurl/wiki/Introduction-to-Figurl)

## Getting started

[Getting started with Figurl](https://github.com/magland/figurl/wiki/Getting-Started-with-Figurl)

## Projects that use figurl

[SortingView](https://github.com/magland/sortingview) - Interactively view, curate, and share results of electrophysiological spike sorting.

[MCMC-monitor](https://github.com/flatironinstitute/mcmc-monitor) - Monitor MCMC runs in real time.

[VolumeView](https://github.com/magland/volumeview) - Interactive view volumetric data and 3D vector fields.

## Authors

Jeremy Magland and Jeff Soules, [Center for Computational Mathematics, Flatiron Institute](https://www.simonsfoundation.org/flatiron/center-for-computational-mathematics)

## License

Apache 2.0
