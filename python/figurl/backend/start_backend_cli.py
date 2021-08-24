# This file was automatically generated by jinjaroot. Do not edit directly.
import click
from .start_backend import start_backend

@click.command('figurl-start-backend')
@click.option('--channel', required=True, help="The kachery channel")
@click.option('--backend-id', required=False, default='', help="The backend ID")
def start_backend_cli(channel: str, backend_id: str):
    bid = backend_id if backend_id != '' else None
    start_backend(channel=channel, backend_id=bid)