---
title: TF Frames in ROSpec
sidebar: home_sidebar
permalink: tf-frames.html
parent: Language
summary: Learn how to specify and verify TF frame broadcasts and listeners in ROSpec.
---

(Coming soon)
{: .important }

# TF Frames in ROSpec

Transform frames (TF) are a critical component of ROS-based robotic systems, providing a way to track spatial relationships between different parts of a robot and its environment. ROSpec provides dedicated syntax for specifying and verifying TF frame relationships.

## TF Fundamentals

In ROS, the TF system:

- Tracks relationships between coordinate frames over time
- Allows transforming points, vectors, and poses between different frames
- Organizes frames in a tree structure, with each frame having a single parent
- Facilitates distributed computing by providing consistent frame data to all nodes

Misconfigurations in TF are common and can lead to serious issues:

- Missing transforms causing navigation failures
- Incorrect frame relationships leading to collisions
- Outdated transforms resulting in incorrect planning

## Specifying TF Frames in ROSpec

ROSpec provides two primary ways to specify TF frame relationships:

### 1. Broadcasts

When a node publishes transformations:

```
node type base_controller_type {
  broadcast odom to base_link;
}
```

This indicates that the node broadcasts the transformation from the `odom` frame to the `base_link` frame.

### 2. Listeners

When a node requires transformations from other nodes:

```
node type laser_scan_matcher_type {
  listens base_link to laser;
}
```

This indicates that the node needs to know the transformation from `base_link` to `laser`, which must be provided by another node.

## TF Frames with Parameters

Often, frame names are configurable parameters:

```
node type amcl_type {
  param global_frame: string = "map";
  param odom_frame: string = "odom";
  param base_frame: string = "base_link";
  
  broadcast content(global_frame) to content(odom_frame);
  broadcast content(odom_frame) to content(base_frame);
}
```

The `content()` function in ROSpec dynamically resolves parameter values for frame names.

## TF Tree Verification

ROSpec automatically verifies the TF tree by:

1. **Checking for missing transforms**: Ensuring that for every frame a node listens to, there is a corresponding broadcaster
2. **Validating tree structure**: Ensuring each frame has exactly one parent
3. **Checking for cycles**: Ensuring there are no loops in the transform tree

For example, given:

```
node instance amcl: amcl_type {
  broadcast map to odom;
}

node instance laser_scan_matcher: laser_scan_matcher_type {
  broadcast odom to base_link;
  listens base_link to laser;
}

node instance laser_driver: laser_driver_type {
  // Missing transform broadcast from base_link to laser
}
```

ROSpec would detect:

```
Error: Missing transform broadcast in the TF tree.
  Node 'laser_scan_matcher' listens to transform from 'base_link' to 'laser',
  but no node broadcasts this transform.
  at system.spec:15:3
```
