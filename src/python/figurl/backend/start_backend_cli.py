# This file was automatically generated by jinjaroot. Do not edit directly.
import click
from .start_backend import start_backend

@click.command('figurl-start-backend')
@click.option('--channel', required=True, help="The kachery channel")
def start_backend_cli(channel: str):
    start_backend(channel=channel)