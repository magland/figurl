from .version import __version__
from .plugins.builtin.altair import Altair
from .plugins.builtin.markdown import Markdown
from .core import Figure, Sync, serialize_wrapper

from hashio import store_file, store_text, store_json, store_npy, store_pkl