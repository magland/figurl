import kachery_client as kc
from figurl.version import __version__

@kc.taskfunction('figurl.get_python_package_version.1', type='query')
def task_get_python_package_version():
    return __version__