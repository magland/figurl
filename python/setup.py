from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/figurl-start-backend'
    ],
    include_package_data = True,
    install_requires=[
        'click',
        'altair',
        'kachery_cloud @ git+https://github.com/scratchrealm/kachery-cloud',
        'pyyaml',
        'google-auth',
        'cachecontrol'
    ]
)
