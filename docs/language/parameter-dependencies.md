---
title: Parameter Dependencies
sidebar: home_sidebar
permalink: parameter-dependencies
parent: Language
nav_order: 2
summary: Learn how to express and verify relationships between parameters in rospec.
---

# Parameter Dependencies

Parameter dependencies are a powerful feature in rospec that allows you to express and verify relationships between configuration values. 
By documenting these dependencies formally, you can prevent subtle misconfigurations that might otherwise lead to unexpected or dangerous robot behavior.

## The `where` Clause

In rospec, parameter dependencies are expressed in the `where` clause of a node type definition:

```rospec
node type <node_name> {
    // Parameters, context information, etc.
} where {
    // Parameter dependencies
}
```

The `where` clause contains logical expressions that must be satisfied for a component configuration to be valid.

## Basic Implications

The most common form of dependency is a simple implication using the arrow operator (`->`):

```rospec
node type laser_scan_matcher_node {
    context is_simulation: bool;
    optional param use_sim_time: bool = false;
} where {
    is_simulation -> use_sim_time;
}
```

This specification states that if the component is running in simulation (`is_simulation` is `true`), then the `use_sim_time` parameter must be `true`. 
This is a common requirement in ROS systems to ensure components use the same time source in simulation environments.

## Parameter Existence Dependencies

Sometimes, the existence of one parameter should depend on another parameter's value. 
The `exists()` function checks if an optional parameter is defined:

```rospec
node type rviz_type {
    context number_of_systems: int;
    optional param tf_prefix: string = "";
} where {
    number_of_systems > 1 -> exists(tf_prefix);
}
```

In this example from an RViz configuration, a transform prefix must be specified when multiple robot systems are running concurrently. 
The `exists()` function ensures not only that the parameter is defined, but that it has a non-empty value.

## Negated Dependencies

Dependencies can also express mutual exclusion or negative relationships:

```rospec
node type rgbdslam_type {
    param base_frame_name: string;
    optional param fixed_camera: bool = false;
} where {
    base_frame_name == "odom" -> !exists(fixed_camera);
}
```

This specifies that if the `base_frame_name` is set to "odom", then the `fixed_camera` parameter should not be defined or should be `false`. 
Such constraints prevent incompatible combinations of parameters that would lead to incorrect system behavior.

## Value Range Dependencies

Parameters often have interdependent valid ranges:

```rospec
node type dwa_local_planner_type {
    optional param max_vel_x: MeterSecond = 0.55;
    optional param min_vel_x: MeterSecond = 0.0;
} where {
    max_vel_x > min_vel_x;
}
```

This constraint ensures the maximum velocity is always greater than the minimum velocity, which is a physical requirement for the planner to function correctly.

## Mathematical Relationships

Dependencies can express complex mathematical relationships between parameters:

```rospec
node type move_base_type {
    param min_obstacle_height: Meter;
    param footprint: double[4][2];
} where {
    footprint[0][1] >= min_obstacle_height;
}
```

This ensures that the y-coordinate of the robot's footprint is at least as large as the minimum obstacle height, preventing the robot from colliding with obstacles it can't detect.

## Conditional Parameter Constraints

Parameter constraints can depend on the values of other parameters:

```rospec
node type amcl_type {
    optional param laser_model_type: LaserModelType = LikelihoodField;
    optional param z_hit: double = 0.5;
    optional param z_max: double = 0.05;
    optional param z_rand: double = 0.5;
    optional param z_short: double = 0.005;
} where {
    laser_model_type == Beam -> z_hit + z_max + z_rand + z_short == 1;
    laser_model_type == LikelihoodField -> z_hit + z_rand == 1;
}
```

This example from AMCL (a widely used localization component) shows how the constraints on certain parameters depend on the value of the `laser_model_type` parameter. 
Different laser models require different combinations of probability parameters, and these must sum to 1 for the probabilistic model to be valid.
