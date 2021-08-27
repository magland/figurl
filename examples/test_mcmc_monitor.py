from typing import List, Union
import figurl as fig
import kachery_client as kc
import time


class MCMCIteration:
    def __init__(self, parameters: dict) -> None:
        self._parameters = parameters
        self._timestamp = time.time()
    @property
    def parameters(self):
        return self._parameters
    @property
    def timestamp(self):
        return self._timestamp
    def to_dict(self):
        return {
            'timestamp': self._timestamp,
            'parameters': self._parameters
        }

class MCMCChain:
    def __init__(self, chain_id: str) -> None:
        self._chain_id = chain_id
        self._timestamp = time.time()
        self._iterations: List[MCMCIteration] = []
        self._feed: Union[None, kc.Feed] = None
        self._pending_iterations: List[MCMCIteration] = []
        self._timestamp_last_report_iterations = 0
    @property
    def chain_id(self):
        return self._chain_id
    @property
    def timestamp(self):
        return self._timestamp
    def get_subfeed(self) -> kc.Subfeed:
        if self._feed is None:
            f = self._create_feed()
            self._feed = f
        else:
            f = self._feed
        return f.load_subfeed('main')
    def add_iteration(self, parameters: dict):
        x = MCMCIteration(parameters)
        self._iterations.append(x)
        self._pending_iterations.append(x)
        self.iterate()
        return x
    def iterate(self):
        if self._feed is None:
            return
        if len(self._pending_iterations) == 0:
            return
        elapsed = time.time() - self._timestamp_last_report_iterations
        if elapsed >= 5:
            self._report_pending_iterations()
    def finalize(self):
        if (self._feed is not None) and (len(self._pending_iterations) > 0):
            self._report_pending_iterations()
    def to_dict(self):
        return {
            'chainId': self._chain_id,
            'timestamp': self._timestamp,
            'iterations': [it.to_dict() for it in self._iterations]
        }
    def _create_feed(self):
        f: kc.Feed = kc.create_feed()
        self._report_pending_iterations()
        return f
    def _get_add_iterations_message(self, iterations: List[MCMCIteration]):
        return {
            'type': 'AddIterations',
            'iterations': [it.to_dict() for it in iterations]
        }
    def _report_pending_iterations(self):
        if self._feed is None:
            return
        if len(self._pending_iterations) == 0:
            return
        sf = self.get_subfeed()
        sf.append_message(self._get_add_iterations_message(self._pending_iterations))
        self._pending_iterations = []
        self._timestamp_last_report_iterations = time.time()

class MCMCRun:
    def __init__(self, run_id: str, *, label: str, meta_data: dict) -> None:
        self._run_id = run_id
        self._label = label
        self._meta_data = meta_data
        self._timestamp = time.time()
        self._chains: List[MCMCChain] = []
        self._feed: Union[None, kc.Feed] = None
    @property
    def run_id(self):
        return self._chain_id
    @property
    def label(self):
        return self._label
    @property
    def meta_data(self):
        return self._meta_data
    @property
    def timestamp(self):
        return self._timestamp
    def add_chain(self, chain_id: str):
        x = MCMCChain(chain_id)
        self._chains.append(x)
        if self._feed is not None:
            self.get_subfeed().append_message(
                self._get_append_chain_message(x)
            )
        return x
    def finalize(self):
        for c in self._chains:
            c.finalize()
    def iterate(self):
        for c in self._chains:
            c.iterate()
    def to_dict(self):
        return {
            'runId': self._run_id,
            'runLabel': self._label,
            'metaData': self._meta_data,
            'timestamp': self._timestamp,
            'chains': [c.to_dict() for c in self._chains]
        }
    def get_subfeed(self) -> kc.Subfeed:
        if self._feed is None:
            f = self._create_feed()
            self._feed = f
        else:
            f = self._feed
        return f.load_subfeed('main')
    def figurl(self, *, snapshot: bool=False):
        if snapshot:
            run_uri = kc.store_json(run.to_dict())
        else:
            subfeed = self.get_subfeed()
            run_uri = subfeed.uri
        return fig.Figure(type='mcmc-monitor.mcmc-run-view.1', data={'runUri': run_uri, 'runId': self._run_id, 'runLabel': self._label, 'timestamp': self._timestamp})
    def _create_feed(self):
        f: kc.Feed = kc.create_feed()
        sf = f.load_subfeed('main')
        sf.append_message({
            'type': 'SetMetaData',
            'metaData': self._meta_data
        })
        for c in self._chains:
            sf.append_message(self._get_append_chain_message(c))
        self.iterate()
        return f
    def _get_append_chain_message(self, c: MCMCChain):
        return {
            'type': 'AddChain',
            'chainId': c.chain_id,
            'timestamp': c.timestamp,
            'chainUri': c.get_subfeed().uri
        }

run = MCMCRun('run-1', label='Run 1', meta_data={})
chain1 = run.add_chain('chain-1')
chain2 = run.add_chain('chain-2')
chain3 = run.add_chain('chain-3')

for i in range(25):
    chain1.add_iteration({'x': i / 25, 'y': -i / 25})
    chain2.add_iteration({'x': (i / 25) ** 2, 'y': -(i / 25) ** 2})
    time.sleep(0.02)
for i in range(20):
    chain3.add_iteration({'x': i / 20, 'y': -i / 20})
    time.sleep(0.02)

F = run.figurl(snapshot=False)
url = F.url(label='test mcmc monitor')
print(url)

for i in range(25, 100):
    print(f'Adding iteration {i + 1}')
    chain1.add_iteration({'x': i / 25, 'y': -i / 25})
    chain2.add_iteration({'x': (i / 25) ** 2, 'y': -(i / 25) ** 2})
    time.sleep(1.5)

run.finalize()
