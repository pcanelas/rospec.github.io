---
title: Getting Started
sidebar: home_sidebar
permalink: getting-started
summary: Learn how to install and set up rospec for your ROS-based robot software projects.
nav_order: 2
---

# Getting Started

## Prerequisites
Before you begin, ensure you have the following installed:
- [Python 3.9](https://www.python.org/downloads/) or higher installed on your system;
- [Poetry](https://python-poetry.org/), for dependency management tool in Python.

## Installation
rospec can be installed either via [pip]() or from [source](https://github.com/pcanelas/rospec).

### Install via pip

You can install rospec using pip, which is the recommended method for most users. Open a terminal and run the following command to install rospec and check its version:

```bash
pip install rospec
rospec --version
```


### Install from source

Installing from source is useful if you want to contribute to the project or if you need the latest features that are not yet available in the pip version.
To install from source, follow these steps:

1. Clone the repository and navigate to the project directory;
```markdown
git clone https://github.com/pcanelas/rospec.git
cd rospec
```
2. Install dependencies using Poetry
```markdown
poetry install
```
3. Activate the virtual environment
```markdown
poetry shell
```

The virtual environment will be activated, and you can run rospec commands from there.

{: .note }
We recommend installing rospec using pip in a virtual environment to avoid conflicts with other Python packages. You can create a virtual environment using `python -m venv venv` and activate it with `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows).


## Basic Workflow

The typical workflow when using rospec involves the following steps:
1. **Component specifications**: Each component in your system should contain a specification file that describes its configurations, their types, and connections;
2. **System specification through component configuration**: Define a `system` declaring the components used and their configurations;
3. **Verify configurations**: Use rospec to check for misconfigurations.

## Your First Component Specification

Let's create a very simple specification with a single parameter and its refinement for a ROS node:

```rospec
node type camera_node_type {
    param frame_rate: double where {_ > 0.0 && _ <= 30.0};  
    publishes to camera/image_raw: sensor_msgs/Image;
}
```

This specification defines a camera node type with:
- A required `frame_rate` parameter that must be a positive number not exceeding 30;
- A defined topic called `camera/image_raw` that it publishes to with the message type `sensor_msgs/Image`.

## System Specification

Create a system integration file to specify how components connect:

```rospec
system {
    node instance main_camera: camera_node_type {
        param frame_rate = -15.0;
    }
}
```

## Verifying Configurations

Run rospec to verify your configurations:

```bash
rospec --specifications path/to/your/specifications.rospec
```

rospec will analyze your specifications and report any misconfigurations.

## Next Steps

Now that you've created your first component specification, you can:

- Learn about [advanced type constraints](type-constraints.html)
- Explore [component connections](component-connections.html)
- See [real-world examples](examples.html)

Happy specifying!
