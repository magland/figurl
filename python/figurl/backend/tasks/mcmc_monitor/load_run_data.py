import kachery_client as kc

@kc.taskfunction('mcmc-monitor.load-run-data.1', type='pure-calculation')
def load_run_data(run_uri: str):
    return kc.load_json(run_uri)