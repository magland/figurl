import altair as alt
from figurl.core.Figure import Figure

class Altair(Figure):
    def __init__(self, chart: alt.Chart):
        data = {
            'spec': chart.to_dict()
        }
        super().__init__(view_url='https://users.flatironinstitute.org/~magland/figurl-views/figurl-vegalite', data=data)