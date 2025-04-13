---
title: Integration Specifications
sidebar: home_sidebar
permalink: integration-spec.html
summary: Learn how to specify and verify the integration of ROS components using ROSpec.
---

# Integration Specifications in ROSpec

Integration specifications define how different components work together in a ROS-based system. This ensures that components are correctly configured and connected, preventing misconfigurations that could lead to unpredictable behavior.

## System Definition

The basic structure for defining a system in ROSpec:

```
system {
  // Node instances
  node instance <node_name>: <node_type> {
    // Parameter assignments
    param <param_name> = <value>;
    ...
    
    // Remapping
    remap <original_topic> to <new_topic>;
  }
  
  // Additional node instances
  ...
}
```

## Node Instantiation

Creating instances of previously defined node types:

```
system {
  node instance move_group: move_group_type {
    param elbow_joint/max_acceleration = 0.5;
    param elbow_joint/min_velocity = 0.1;
    param elbow_joint/max_velocity = 2.0;
    param elbow_joint/has_velocity_limits = true;
  }
}
```

## Parameter Assignment

Assigning values to parameters defined in the node type:

```
node instance laser_scan_matcher: laser_scan_matcher_type {
  param distance_to_obstacle_service = "get_distance_to_obstacle";
  param use_sim_time = true;
  context is_simulation = true;
}
```

## Topic Remapping

Redirecting topics to different names:

```
node instance hector_map_server: hector_map_server_type {
  remap /hector_map_server/get_distance_to_obstacle to get_distance_to_obstacle;
}
```

## Connection Verification

When a system is defined, ROSpec verifies:

1. **Publisher-Subscriber Connections**: Ensuring that for each subscriber, there is a matching publisher with a compatible message type
2. **Service Provider-Consumer Connections**: Checking that service consumers have corresponding service providers
3. **QoS Compatibility**: Validating that Quality of Service settings are compatible between publishers and subscribers
4. **TF Frame Connectivity**: Ensuring that the TF tree is properly connected

## Plugin Integration

Integrating plugins with nodes:

```
plugin instance right_arm: right_arm_type {
  param tip_name = "right_gripper";
  param root_name = "base_link";
}

node instance arm_kinematics: arm_kinematics_constraint_aware_type {
  param group = right_arm;  // Assigns the plugin to the node
}
```

## Context Validation

Ensuring that components are deployed in the correct context:

```
node instance navigation_stack: navigation_stack_type {
  context is_simulation = true;
  param use_sim_time = true;  // Must match the context
}
```

## Example: Warehouse Robot System

Here's an example of a system configuration for a warehouse robot:

```
system {
  node instance amcl: amcl_type {
    param robot_model_type = DifferentialMotionModel;
    param scan_topic_name = "scan";
    param map_topic_name = "map";
    param z_hit = 0.7;
    param z_rand = 0.3;
    param laser_model_type = LikelihoodField;
  }
  
  node instance map_server: map_server_type {
    param map_file = "warehouse_map.yaml";
    param use_sim_time = true;
  }
  
  node instance move_base: move_base_type {
    param max_vel_x = 0.5;
    param min_vel_x = 0.1;
    param max_rotational_vel = 1.0;
    param min_rotational_vel = 0.1;
    
    remap cmd_vel to mobile_base/commands/velocity;
  }
  
  node instance controller: controller_type {
    param mobile_base_controller/type = "diff_drive_controller";
    param mobile_base_controller/left_wheel = "left_wheel_joint";
    param mobile_base_controller/right_wheel = "right_wheel_joint";
    param mobile_base_controller/pose_covariance_diagonal = [0.001, 0.001, 1000000.0, 1000000.0, 1000000.0, 0.03];
    
    context is_simulation = true;
  }
}
```

## Verification Process

When you run the ROSpec verification tool on a system configuration, it:

1. Loads all node type definitions referenced in the system
2. Instantiates node instances with their parameter values
3. Checks that all required parameters are provided
4. Validates parameter values against their constraints
5. Verifies that parameter dependencies are respected
6. Checks for proper connections between components
7. Ensures contextual requirements are met
8. Reports any detected misconfigurations

## Running Verification

```bash
rospec verify warehouse_system.spec
```

If the verification passes, all components are correctly configured and integrated. If it fails, ROSpec will provide detailed error messages about the detected misconfigurations.
