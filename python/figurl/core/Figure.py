import os
import json
from typing import Any, Union
import urllib.parse
import kachery_client as kc
from .serialize_wrapper import _serialize
from .Sync import Sync

class Figure:
    def __init__(self, *, data: Any, view_url: Union[str, None]=None):
        self._view_url = view_url
        self._data = _replace_sync_objects(data)
        self._serialized_data = _serialize(self._data, compress_npy=True)

        # check up front whether figure data is too large
        max_data_size = 30 * 1000 * 1000
        data_size = len(json.dumps(self._serialized_data))
        if data_size > max_data_size:
            raise Exception(f'Figure data is too large ({data_size} > {max_data_size} bytes). A live view is probably in order for this figure.')

        if view_url is not None:
            self._object = None
        else:
            raise Exception('Missing view_url')
        self._data_uri: Union[str, None] = None # new system
    @property
    def object(self):
        return self._object
    @property
    def view_url(self):
        return self._view_url # new system
    @property
    def data(self):
        return self._data
    def url(self, *, label: str, channel: Union[str, None]=None, base_url: Union[str, None]=None, view_url: Union[str, None] = None):
        if base_url is None:
            base_url = default_base_url
        if channel is None:
            if default_channel is None:
                raise Exception('No channel specified and FIGURL_CHANNEL is not set.')
            channel = default_channel
        if self._view_url is not None: # new system:
            if self._data_uri is None:
                self._data_uri = kc.store_json(self._serialized_data)
            data_hash = self._data_uri.split('/')[2]
            kc.upload_file(self._data_uri, channel=channel)
            if view_url is None:
                view_url = self._view_url
            url = f'{base_url}/f?v={view_url}&d={data_hash}&channel={channel}&label={_enc(label)}'
            return url
        else:
            raise Exception('No self._view_url')

def _enc(x: str):
    return urllib.parse.quote(x)

def _replace_sync_objects(x: Any):
    if isinstance(x, Sync):
        return x.object
    elif isinstance(x, dict):
        ret = {}
        for k, v in x.items():
            ret[k] = _replace_sync_objects(v)
        return ret
    elif isinstance(x, list):
        return [_replace_sync_objects(a) for a in x]
    elif isinstance(x, tuple):
        return tuple([_replace_sync_objects(a) for a in x])
    else:
        return x

default_base_url = os.getenv('FIGURL_BASE_URL', 'https://figurl.org')
default_channel = os.getenv('FIGURL_CHANNEL', None)