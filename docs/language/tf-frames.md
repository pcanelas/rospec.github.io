---
title: TF Frames
sidebar: home_sidebar
permalink: tf-frames
parent: Language
nav_order: 3
summary: Learn how to specify and verify TF frame broadcasts and listeners in rospec.
---

# TF Frames

Transform frames (TF) are a fundamental component of ROS-based robotic systems. 
They provide a way to track spatial relationships between different parts of a robot and its environment, enabling consistent coordinate transformations for sensors, actuators, and planning algorithms. 
rospec offers dedicated syntax for specifying and verifying these transform relationships.

## Transform Frame Fundamentals

In ROS, the transform system:

- Maintains a tree structure of coordinate frames
- Allows transforming positions, orientations, and velocities between frames
- Tracks the evolution of these relationships over time
- Provides a distributed framework where different components can contribute transforms

Common misconfigurations in transform frames include:

- Missing transforms creating disconnected frame segments
- Multiple components broadcasting the same transform
- Incorrect parent-child relationships
- Outdated or stale transforms

These issues can lead to serious problems like navigation failures, collisions, or unpredictable motion. 
rospec helps prevent these problems through static verification of transform relationships.

## Specifying Transform Broadcasts

Components that publish transforms use the `broadcast` keyword:

```rospec
node type amcl_type {
    broadcast map to odom;
    broadcast odom to base_link;
}
```

This example from an AMCL localization node indicates that it broadcasts two transforms:
1. From the `map` frame to the `odom` frame
2. From the `odom` frame to the `base_link` frame

These broadcasts contribute to the transform tree, allowing other components to transform coordinates between these frames.

## Dynamically Named Frames

Often, frame names are configurable parameters. rospec supports this through the `content()` function:

```rospec
node type amcl_type {
    param odom: string = "odom";
    param map: string = "map";

    broadcast content(map) to content(odom);
    broadcast content(odom) to base_link;
}
```

This specification indicates that the transform frame names come from parameters, making the component more configurable. 
The `content()` function resolves the parameter value at verification time.

## Specifying Transform Listeners

Components that need transforms but don't broadcast them use the `listen` keyword:

```rospec
node type laser_scan_matcher_node {
    broadcast world to base_link;
    listen base_link to laser;
}
```

This indicates that the component:
1. Broadcasts the transform from `world` to `base_link`
2. Requires a transform from `base_link` to `laser` that must be provided by another component

The `listen` keyword creates a verification requirement that the specified transform must be available in the system.

## Transform Tree Verification

When analyzing a system specification, rospec verifies the completeness and consistency of the transform tree:

```rospec
system {
    node instance amcl: amcl_type { }
    node instance map_to_odom: static_transform_publisher_type { }
}
```

In this example, both nodes broadcast the transform from `map` to `odom`. 
rospec would detect this inconsistency, as having multiple sources for the same transform can cause unpredictable behavior.

## Checking for Missing Transforms

rospec also verifies that all required transforms are provided:

```rospec
system {
    node instance laser_scan_matcher: laser_scan_matcher_node {
        // Listens for base_link to laser transform, but no component provides it
    }
}
```

In this case, rospec would identify that the transform from `base_link` to `laser` is required but not provided by any component in the system.