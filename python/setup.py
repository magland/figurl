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
        'kachery-client>=1.0.15',
        'pyyaml',
        'google-auth',
        'cachecontrol'
    ]
)
