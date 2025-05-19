---
title: Component Specification
sidebar: home_sidebar
permalink: component-specification
parent: Language
nav_order: 0
summary: Learn how to write rospec specifications for ROS components.
---

# Component Specifications 

Component specifications serve as formal contracts that define the expected behavior, configuration parameters, and communication interfaces for ROS components. They enable both documentation for users and verification to prevent misconfigurations.

## Node Type Definition

The foundation of any rospec specification is the node type definition. This structure encapsulates all the information about a component's requirements, capabilities, and constraints:

```rospec
node type <node_type_name> {
    # Parameters, context information, etc.
} where {
    # Parameter dependencies and constraints
}
```

Let's explore each element of a component specification in detail.

## Parameters

Parameters are configuration values that affect component behavior. In rospec, you can specify both required and optional parameters, along with their types and constraints.

**Required** parameters must be provided when creating a node instance, while **optional** parameters can have default values:

```rospec
node type move_base_type {
    param min_obstacle_height: Meter;
    param footprint: double[4][2];

    optional param max_vel_x: MeterSecond = 0.55;
    optional param min_vel_x: MeterSecond = 0.0;
}
```

In this example from a move_base node, we define required parameters for minimum obstacle height (using a domain-specific `Meter` type) and a footprint defined as a 4×2 array of doubles representing the robot's outline. The velocity parameters are optional with default values. The `optional` keyword indicates that integrators don't need to explicitly set these values, as they will default to the specified values if omitted.

## Type Constraints

rospec uses liquid types to express constraints on parameter values, allowing for precise specification of acceptable values.

### Numeric Constraints

You can constrain numeric values to specific ranges:

```rospec
node type openni_node_type {
    optional param depth_time_offset: Second where {_ >= -1 and _ <= 1} = 0.0;
    optional param image_time_offset: Second where {_ >= -1 and _ <= 1} = 0.0;
}
```

Here, both time offset parameters must be between -1 and 1 seconds. The underscore (`_`) refers to the parameter value being constrained.

### Enumerated Types

For parameters with a fixed set of valid values, you can use enumerated types:

```rospec
type alias Modes: Enum[SXGA15Hz, VGA30Hz, VGA25Hz, QVGA25Hz, QVGA30Hz, QVGA60Hz, QQVGA25Hz, QQVGA30Hz, QQVGA60Hz];

node type openni_node_type {
    optional param image_mode: Modes = VGA30Hz;
    optional param depth_mode: Modes = VGA30Hz;
}
```

This ensures the parameter can only be assigned one of the enumerated values, preventing invalid configurations.

## Context Information

Context represents deployment or environmental factors that affect a component's configuration:

```rospec
node type laser_scan_matcher_node {
    context is_simulation: bool;
    optional param use_sim_time: bool = false;
} where {
    is_simulation -> use_sim_time;
}
```

This example shows a node that needs to know if it's running in simulation. The `where` clause specifies that if the context is simulation, the `use_sim_time` parameter must be true.

Here's another example showing how context can influence component behavior:

```rospec
node type rviz_type {
    context number_of_systems: int;
    optional param tf_prefix: string = "";
} where {
    number_of_systems > 1 -> exists(tf_prefix);
}
```

In this case, when multiple robot systems are running simultaneously (indicated by `number_of_systems > 1`), a transform prefix must be specified to prevent transform conflicts.

## Parameter Dependencies

The `where` clause in a node type definition allows you to express relationships between parameters:

```rospec
node type rgbdslam_type {
    param fixed_frame_name: string;
    param ground_truth_frame_name: string;
    param base_frame_name: string;
    optional param fixed_camera: bool = false;
} where {
    base_frame_name == "odom" -> !exists(fixed_camera);
}
```

This example from rgbdslam shows that if the `base_frame_name` is "odom", then the `fixed_camera` parameter cannot be defined (or must be false).

Dependencies can also involve mathematical relationships:

```rospec
node type move_base_type {
    param min_obstacle_height: Meter;
    param footprint: double[4][2];
} where {
    footprint[0][1] >= min_obstacle_height;
}
```

This ensures that the footprint's y-coordinate is at least as large as the minimum obstacle height.

Another common pattern is ensuring physical constraints are maintained:

```rospec
node type dwa_local_planner_type {
    optional param max_vel_x: MeterSecond = 0.55;
    optional param min_vel_x: MeterSecond = 0.0;
} where {
    max_vel_x > min_vel_x;
}
```

This enforces that the maximum velocity must be greater than the minimum velocity.

## Type Aliases

To improve readability and reusability, rospec allows you to define type aliases:

```rospec
type alias Meter: double;
type alias MeterSecond: float;
type alias Second: float;
```

This example defines domain-specific types for physical units, making specifications more expressive and easier to understand.

## Arguments

Arguments are command-line inputs provided when launching nodes:

```rospec
node type stereo_image_proc_type {
    argument manager: string;
}
```

Similar to parameters, arguments can be required or optional with default values.

## Putting It All Together

A complete node specification might look like:

```rospec
node type planning_scene_warehouse_viewer_t {
    context is_simulation: bool;

    optional argument use_monitor: bool = false;
    optional argument use_collision_map: bool = false;
    optional param use_robot_data: bool = false;
} where {
    is_simulation -> use_monitor;
    is_simulation -> !use_robot_data;
}
```

This specification defines a planning scene warehouse viewer node that:
1. Has contextual knowledge about whether it's running in simulation
2. Has optional arguments for monitoring and collision map usage
3. Has an optional parameter for using robot data
4. Enforces relationships between the simulation context and other parameters

When integrators use this specification, rospec can verify that their configuration respects all these requirements, preventing misconfigurations before deployment.
