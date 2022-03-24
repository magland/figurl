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
        'hither>=0.7.0',
        'hashio @ git+https://github.com/scratchrealm/hashio',
        'pyyaml',
        'google-auth',
        'cachecontrol'
    ]
)
