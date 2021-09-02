import kachery_client as kc

@kc.taskfunction('spikeforest.load-spikeforest-data.1', type='pure-calculation')
def load_spikeforest_data(uri: str):
    return kc.load_json(uri)