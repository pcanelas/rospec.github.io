---
title: TF Frames in ROSpec
sidebar: home_sidebar
permalink: tf-frames.html
summary: Learn how to specify and verify TF frame broadcasts and listeners in ROSpec.
---

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

## Complex TF Examples

### Robot with Multiple Sensors

```
node type robot_state_publisher_type {
  param robot_description: string;
  param robot_description_file: string;
  
  broadcast base_link to left_wheel;
  broadcast base_link to right_wheel;
  broadcast base_link to front_laser;
  broadcast base_link to rear_camera;
}

node type front_laser_filter_type {
  param frame_id: string = "front_laser";
  
  listens base_link to content(frame_id);
  
  subscribes to scan_raw: sensor_msgs/LaserScan;
  publishes to scan_filtered: sensor_msgs/LaserScan;
}

node type localization_type {
  listens map to odom;
  listens odom to base_link;
  listens base_link to front_laser;
  
  broadcast map to odom;
}
```

### Mobile Manipulator

```
node type arm_controller_type {
  param arm_base_frame: string = "arm_base";
  param end_effector_frame: string = "gripper";
  
  broadcast base_link to content(arm_base_frame);
  broadcast content(arm_base_frame) to shoulder;
  broadcast shoulder to elbow;
  broadcast elbow to wrist;
  broadcast wrist to content(end_effector_frame);
}

node type grasp_planner_type {
  param end_effector_frame: string = "gripper";
  param object_frame: string = "target_object";
  
  listens content(end_effector_frame) to content(object_frame);
}
```

## Best Practices for TF Frames in ROSpec

1. **Use consistent naming conventions** for frame IDs
2. **Make frame IDs configurable parameters** when appropriate
3. **Be explicit about which frames your node broadcasts**
4. **Be explicit about which transforms your node needs**
5. **Document the meaning and orientation of each frame**
6. **Use the context information** to specify which frames are relevant in different deployment scenarios

## Static vs. Dynamic Transforms

ROSpec doesn't currently distinguish between static and dynamic transforms, but you can use comments to document this:

```
node type robot_state_publisher_type {
  // Static transforms from URDF
  broadcast base_link to imu;
  broadcast base_link to lidar;
  
  // Dynamic transforms from joint states
  broadcast base_link to arm_base;
  broadcast arm_base to arm_link_1;
  broadcast arm_link_1 to arm_link_2;
}
```

## Frame Prefixes

In ROS, frame IDs often use prefixes in different namespaces. ROSpec supports this through string parameters:

```
node type multi_robot_controller_type {
  param robot_name: string;
  param global_frame: string = "map";
  
  broadcast content(global_frame) to $(robot_name)/odom;
  broadcast $(robot_name)/odom to $(robot_name)/base_link;
}
```

The syntax `$(robot_name)` is a string interpolation that resolves the parameter value.

## Complete TF Tree Example

```
system {
  node instance map_server: map_server_type { }
  
  node instance amcl: amcl_type {
    param global_frame = "map";
    param odom_frame = "odom";
    param base_frame = "base_link";
    
    broadcast map to odom;
  }
  
  node instance robot_state_publisher: robot_state_publisher_type {
    broadcast base_link to base_footprint;
    broadcast base_footprint to chassis;
    broadcast chassis to laser;
    broadcast chassis to camera;
  }
  
  node instance navigation: navigation_type {
    listens map to odom;
    listens odom to base_link;
    listens base_link to laser;
  }
  
  node instance perception: perception_type {
    listens odom to camera;
  }
}
```

By specifying TF frames in ROSpec, you can detect misconfigurations in the transform tree before deploying your system, saving debugging time and preventing potentially dangerous runtime failures.
