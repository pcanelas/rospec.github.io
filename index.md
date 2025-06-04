---
title: Home
layout: home
nav_order: 1
description: A Domain-Specific Language for detecting misconfigurations in ROS-based robot software
permalink: /
---

# <img src="assets/images/logo.svg" alt="rospec logo" style="height: 40px; vertical-align: middle;"> rospec - A Domain-Specific Language for ROS-based Robot Software
{: .fs-9 }

Ensuring the correct configuration and integration of your ROS components.
{: .fs-6 .fw-300 }

[Get Started](getting-started){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View on GitHub](https://github.com/pcanelas/rospec){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## What is rospec?

rospec is a domain-specific language designed to specify and verify component configurations and their integration in ROS-based robot software. 
With rospec, you can:

{: .note }
Component-based robot software frameworks like ROS allow developers to quickly compose and execute systems by focusing on configuring and integrating reusable components. 
However, these components often lack documentation on how to configure and integrate them correctly, leading to misconfigurations that can cause unpredictable and potentially dangerous robot behaviors.

- **Define component specifications** with explicit parameter types, constraints, and dependencies;
- **Verify system integrations** to ensure components are correctly configured and connected;
- **Detect misconfigurations early** before they lead to runtime failures or dangerous behaviors;
- **Document component requirements** for other developers in a formal, verifiable way.

## Quick Example

Here's a simple example of a rospec specification for a camera node and its configuration:

```rospec
node type camera_node_type {
    param frame_rate: double where {_ > 0.0 and _ <= 30.0};
    publishes to camera/image_raw: sensor_msgs/Image;
}

system {
    node instance main_camera: camera_node_type {
        param frame_rate = 15.0;  # Valid configuration
    }
}
```

{: .highlight }
In this example, rospec ensures that the camera's frame rate is within the allowed range of (0, 30] frames per second, helping prevent performance issues or hardware damage from invalid configurations.

## Why rospec?

{: .new }
rospec provides a formal way to specify and verify component configurations and integrations, reducing the risks associated with misconfigured robot systems.

- **Designed for ROS**: Built from the ground up with ROS concepts and patterns in mind;
- **Expressive Type System**: Uses liquid types to express constraints on parameter values;
- **Comprehensive Verification**: Checks parameter types, bounds, dependencies, communication patterns, and more;
- **Two Stakeholder Views**: Addresses both component writers who create reusable components and integrators who build systems.

## Features

rospec supports verification of multiple kinds of misconfigurations:

- **Parameter Type Checking**: Ensures parameters have correct types;
- **Value Constraints**: Enforces bounds and other restrictions on parameter values;
- **Parameter Dependencies**: Verifies relationships between parameters (e.g., one parameter requiring another);
- **Communication Verification**: Checks publisher-subscriber, service, and action connections;
- **QoS Compatibility**: Ensures Quality of Service settings are compatible;
- **TF Frame Verification**: Validates transform tree connectivity;
- **Context Validation**: Checks that components are deployed in appropriate contexts.

## Research Paper

This is a research project within the [Software and Societal Systems Department (S3D)](https://s3d.cmu.edu/) and the [Robotics Institute](https://www.ri.cmu.edu/) at Carnegie Mellon University, and [LASIGE](https://lasige.pt/) at University of Lisbon. 
For a detailed explanation of the language design, semantics, and evaluation, check out our paper (currently under review):

```
@inproceedings{canelas2025rospec,
  title     = {},
  author    = {},
  booktitle = {},
  volume    = {},
  number    = {},
  pages     = {},
  year      = {},
  doi       = {}
}
```

Ready to try it out? [Get started now](getting-started) or check out our [examples](examples) to see how rospec can help improve the reliability of your robot software.