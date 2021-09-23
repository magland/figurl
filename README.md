# figurl

Shareable web links for figures generated using Python.

## Sharing static figures

The first step in sharing static figures is to [setup and host a kachery node](https://github.com/kacheryhub/kachery-doc/blob/main/doc/hostKacheryNode.md) on your computer. You can read more about the kachery system [here](https://github.com/kacheryhub/kachery-doc/blob/main/README.md).

Once you have a running node and have registered your node on kacheryhub, you will need to [create a kachery channel](). This is where your figure data will be stored in the cloud.

Next, set the following environment variable to tell figurl where to send the figure data:

```
export FIGURL_CHANNEL=<name-of-your-channel>
```

Finally, you can create an altair chart and send it to your channel via the following example:

```python
#!/usr/bin/env python3

import figurl as fig
import altair as alt
import pandas as pd

source = pd.DataFrame({
    'a': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    'b': [28, 55, 43, 91, 81, 53, 19, 87, 52]
})
chart = alt.Chart(source).mark_bar().encode(
    x='a',
    y='b'
)

url = fig.Altair(chart).url(label='vegalite')
print(url)
```

This script will print a shareable URL to your figure which you can open in any modern web browser.