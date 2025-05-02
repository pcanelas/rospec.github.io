---
title: Getting Started
sidebar: home_sidebar
permalink: getting-started.html
summary: Learn how to install and set up rospec for your ROS-based robot software projects.
nav_order: 2
---

# Getting Started

This guide will help you set up rospec and start creating your first component specifications.

## Installation

rospec can be installed via pip, the Python package manager:

```bash
pip install rospec
```

Verify the installation by checking the version:

```bash
rospec --version
```

## Prerequisites

rospec requires:

- Python 3.9 or higher
- poetry

## Basic Workflow

The typical workflow with rospec involves:

1. **Define component specifications**: Create specifications for each component in your system
2. **Create system integration specifications**: Define how components integrate together
3. **Verify configurations**: Use rospec to check for misconfigurations

## Your First Component Specification

Let's create a simple specification for a ROS node:

```
node type camera_node_type {
  param frame_rate: double where {_ > 0.0 && _ <= 30.0};
  param resolution: string;
  
  publishes to camera/image_raw: sensor_msgs/Image;
  
  optional param camera_name: string = "main_camera";
}
```

This specification defines a camera node type with:
- A required `frame_rate` parameter that must be a positive number not exceeding 30
- A required `resolution` parameter of type string
- A defined topic it publishes to with the message type
- An optional parameter with a default value

## System Integration

Create a system integration file to specify how components connect:

```
system {
  node instance main_camera: camera_node_type {
    param frame_rate = -15.0;
    param resolution = "640x480";
  }
  
  node instance image_processor: processor_type {
    param min_frame_rate = 10.0;
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
- Understand [parameter dependencies](parameter-dependencies.html)
- Explore [component connections](component-connections.html)
- See [real-world examples](examples.html)

Happy specifying!
