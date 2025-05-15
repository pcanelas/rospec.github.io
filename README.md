<p align="right">
    <a href="https://badge.fury.io/rb/just-the-docs"><img src="https://badge.fury.io/rb/just-the-docs.svg" alt="Gem version"></a> <a href="https://github.com/just-the-docs/just-the-docs/actions/workflows/ci.yml"><img src="https://github.com/just-the-docs/just-the-docs/actions/workflows/ci.yml/badge.svg" alt="CI Build status"></a> <a href="https://app.netlify.com/sites/just-the-docs/deploys"><img src="https://api.netlify.com/api/v1/badges/9dc0386d-c2a4-4077-ad83-f02c33a6c0ca/deploy-status" alt="Netlify Status"></a>
</p>
<br><br>
<p align="center">
    <h1 align="center">Just the Docs</h1>
    <p align="center">A modern, highly customizable, and responsive Jekyll theme for documentation with built-in search.<br>Easily hosted on GitHub Pages with few dependencies.</p>
    <p align="center"><strong><a href="https://just-the-docs.com/">See it in action!</a></strong></p>
    <br><br><br>
</p>

# Adding rospec as a Submodule

To add rospec as a Git submodule to your repository, follow these steps:

```bash
# From your repository root directory
git submodule add https://github.com/pcanelas/rospec.git rospec
git submodule update --init --recursive
```

This will:
1. Add the rospec repository as a submodule in a directory called 'rospec'
2. Initialize the submodule and pull its contents

## Installing Dependencies

After adding the submodule, you'll need to install its dependencies:

### Using Poetry (Recommended)

If you're using Poetry (recommended based on the rospec project structure):

```bash
# Navigate to the rospec directory
cd rospec

# Install dependencies with Poetry
poetry install

# You can use the virtual environment created by Poetry
poetry shell
```

### Using Pip

Alternatively, you can install dependencies using pip:

```bash
# Navigate to the rospec directory
cd rospec

# Install dependencies from requirements.txt
pip install -r requirements.txt

# Install the package in development mode
pip install -e .
```

Make sure you're using Python 3.9 or later, as required by rospec.