#!/usr/bin/env python
import os
from setuptools import setup, __version__

path = os.path.join(os.path.dirname(__file__), 'src/rospec/version.py')
with open(path, 'r') as f:
    exec(f.read())

setup(version=__version__, include_package_data=True)
