from typing import List
from figurl.core.Figure import Figure

class Markdown(Figure):
    def __init__(self, source: str):
        data = {
            'source': source
        }
        super().__init__(type='Markdown.1', data=data)