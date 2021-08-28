from monitor_stan_run import finalize_monitor_stan_run, monitor_stan_run
from test_mcmc_monitor import MCMCRun
from typing import List, Union
from cmdstanpy import CmdStanModel
import tempfile
import uuid
import os
import shutil
import time
# from mcmc_monitor import stan_monitor

class stan_monitor():
    def __init__(self, *, label: str, parameter_names: List[str], meta_data: dict={}, output_dir: Union[str, None]=None):
        self._label = label
        self._parameter_names = parameter_names
        self._meta_data = meta_data
        self._output_dir = output_dir
        self._prefix = 'mcmc-monitor-'
        self._run_id = 'RUN-' + _random_id()

    def __enter__(self):
        if self._output_dir is None:
            dirpath = None
            self._output_dir = str(tempfile.mkdtemp(
                prefix=self._prefix, dir=dirpath))
            self._remove = True
        else:
            self._remove = False
        
        self._run = MCMCRun(self._run_id, label=self._label, meta_data=self._meta_data)
        
        # begin monitoring the output directory for this run
        figure = self._run.figurl()
        url = figure.url(label=self._label)
        print('========================================================')
        print(f'Monitoring stan run in directory: {self._output_dir}')
        print(f'URL: {url}')
        print('========================================================')
        monitor_stan_run(
            run=self._run,
            stan_output_dir=self._output_dir,
            parameter_names=self._parameter_names
        )
        

        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # allow monitoring to finish before removing directory
        print(f'Finalizing monitoring of stan run in directory: {self._output_dir}')
        try:
            finalize_monitor_stan_run(self._output_dir)
        except Exception as e:
            print(f'WARNING: problem finalizing stan run: {str(e)}')
        try:
            self._run.finalize()
        except Exception as e:
            print(f'WARNING: problem finalizing stan run (2): {str(e)}')
        if self._remove:
            _rmdir_with_retries(self._output_dir, num_retries=5)

    def workspace_uri(self):
        return self._workspace_uri

def _random_id():
    return str(uuid.uuid4())[-12:]

def _rmdir_with_retries(dirname: str, num_retries: int, delay_between_tries: float=1):
    for retry_num in range(1, num_retries + 1):
        if not os.path.exists(dirname):
            return
        try:
            shutil.rmtree(dirname)
            break
        except: # pragma: no cover
            if retry_num < num_retries:
                print('Retrying to remove directory: {}'.format(dirname))
                time.sleep(delay_between_tries)
            else:
                raise Exception('Unable to remove directory after {} tries: {}'.format(num_retries, dirname))


def main():
    # These are adjustable
    rho = 0.95
    N = 350
    iter_warmup = 100
    iter_sampling = 100

    # specify .stan file for this model
    thisdir = os.path.dirname(os.path.realpath(__file__))
    model_fname = f'{thisdir}/multi-normal.stan'

    with stan_monitor(
        label='multi-normal-example',
        # monitor these parameters
        parameter_names=["lp__", "accept_stat__", "stepsize__", "treedepth__", "n_leapfrog__", "divergent__", "energy__"],
        # attach meta data (for future use)
        meta_data={}
        ) as monitor:
            # Load the model
            model = CmdStanModel(stan_file=model_fname)

            # Start sampling the posterior for this model/data (we need to use monitor._output_dir as the output directory)
            fit = model.sample(data={'N': N, 'rho': rho}, output_dir=monitor._output_dir,
                            iter_sampling=iter_sampling, iter_warmup=iter_warmup, save_warmup=True)

if __name__ == '__main__':
    main()