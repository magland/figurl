import altair as alt
from figurl.core.Figure import Figure

class Altair(Figure):
    def __init__(self, chart: alt.Chart):
        data = {
            'spec': chart.to_dict()
        }
        super().__init__(view_url='gs://figurl/vegalite-1', data=data)