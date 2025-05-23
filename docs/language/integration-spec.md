---
title: System Integration
sidebar: home_sidebar
permalink: system
parent: Language
nav_order: 5
summary: Learn how to specify and verify the integration of ROS components using rospec.
---

# System Integration

While component specifications define the requirements and capabilities of individual components, system integration specifications define how these components work together in a complete robot system. 
These integration specifications allow rospec to verify that components are correctly configured and connected, preventing misconfigurations before deployment.

## System Definition

A system specification in rospec begins with the `system` keyword, followed by a block containing node instances:

```rospec
system {
    # Node instances
    # Plugin assignments
}
```

The system block is typically defined in a separate file from component specifications, allowing the separation of component development (Writer role) from system integration (Integrator role).

## Node Instantiation

To use a component in a system, you create an instance of its node type:

```rospec
system {
    node instance laser_scan_matcher: laser_scan_matcher_node {
        context is_simulation = true;
        param use_sim_time = true;
    }
}
```

This creates an instance of the `laser_scan_matcher_node` type named `laser_scan_matcher`, setting its simulation context to `true` and its `use_sim_time` parameter to `true`.

Each node instance must satisfy all the requirements specified in its node type definition, including parameter types, constraints, and dependencies.

## Parameter Assignment

Within a node instance, you assign values to parameters:

```rospec
node instance move_base: move_base_type {
    param min_obstacle_height = 0.10;
    param footprint = [[-0.4, -0.4], [-0.4, 0.4], [0.4, 0.4], [0.4, 0.4]];
}
```

When assigning parameter values, rospec verifies that:
- The values match the expected types
- The values satisfy any constraints defined in the node type
- All required parameters are provided
- All parameter dependencies are satisfied

If a parameter assignment violates any of these requirements, rospec reports an error, helping you identify and fix misconfigurations.

## Context Configuration

Context information defines the deployment environment for components. When instantiating nodes, you specify the context values:

```rospec
node instance planning_scene_warehouse_viewer: planning_scene_warehouse_viewer_t {
    context is_simulation = true;
}
```

This sets the `is_simulation` context to `true` for this node instance. rospec will verify that all context-dependent parameter constraints are satisfied based on this value.

## Default Values and Optional Parameters

For optional parameters with default values, you can choose to either provide a value or accept the default:

```rospec
node instance dwa_local_planner: dwa_local_planner_type {
    # Using the default values for max_vel_x (0.55) and min_vel_x (0.0)
    param penalize_negative_x = true;
}
```

In this example, the node instance uses the default values for `max_vel_x` and `min_vel_x` defined in the node type, while explicitly setting `penalize_negative_x` to `true`.

## Multiple Node Instances
A system typically contains multiple node instances that work together:

```rospec
system {
    node instance amcl: amcl_type {
        param odom = "odom_error";
    }
    
    node instance custom_node: custom_node_type {
        # This node broadcasts odom to odom_error
    }
}
```

This example shows two node instances: an AMCL localization node and a custom node that provides transform information used by AMCL.


This remaps a service provided by the `hector_map_server` node to a different name, allowing it to connect with other components that expect the service at this new name.

## Connection Verification
When you define a system, rospec automatically verifies connections between components:

```rospec
system {
    node instance openni_node1: openni_node_type {
        param depth_registration = true;
    }

    node instance openni_node2: openni_node_type {
        param depth_registration = true;
        param rgb_frame_id = "/openni_rgb_optical_frame";
        param depth_frame_id = "/openni_depth_optical_frame";
    }
}
```

In this example with two depth camera nodes, rospec would verify that they don't publish to the same topics (which would cause conflicts) by checking the cardinality constraints specified in the node type.
