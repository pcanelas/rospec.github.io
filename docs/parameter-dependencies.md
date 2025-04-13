---
title: Parameter Dependencies
sidebar: home_sidebar
permalink: parameter-dependencies.html
summary: Learn how to express and verify relationships between parameters in ROSpec.
---

# Parameter Dependencies in ROSpec

One of the powerful features of ROSpec is the ability to express and verify dependencies between parameters. This allows component writers to document and enforce complex relationships that must be maintained for correct operation.

## Basic Dependencies

The most common form of dependency is a simple implication between parameters:

```
node type controller_type {
  optional param use_velocity_limits: bool = false;
  optional param max_velocity: double;
  optional param min_velocity: double;
  
} where {
  use_velocity_limits -> exists(max_velocity);
  use_velocity_limits -> exists(min_velocity);
}
```

This specifies that if `use_velocity_limits` is `true`, then both `max_velocity` and `min_velocity` must be defined.

## Value Dependencies

Dependencies can also involve specific parameter values:

```
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

This example from the AMCL node shows how the meaning and constraints on certain parameters depend on the value of the `laser_model_type` parameter.

## Existence Dependencies

You can use the `exists()` function to check if an optional parameter is defined:

```
node type navigation_stack_type {
  optional param global_planner: string;
  optional param global_planner_frequency: double;
  
} where {
  exists(global_planner) -> exists(global_planner_frequency);
}
```

This ensures that if a global planner is specified, its frequency must also be defined.

## Context Dependencies

ROSpec allows expressing dependencies between context values and parameters:

```
node type laser_scan_matcher_type {
  context is_simulation: bool;
  optional param use_sim_time: bool = false;
  
} where {
  is_simulation -> use_sim_time;
}
```

This ensures that if the component is deployed in a simulation context, the `use_sim_time` parameter must be `true`.

## Numeric Relationships

For numeric parameters, you can express mathematical relationships:

```
node type velocity_controller_type {
  optional param min_velocity: double;
  optional param max_velocity: double;
  optional param default_velocity: double;
  
} where {
  exists(min_velocity) && exists(max_velocity) -> min_velocity < max_velocity;
  exists(default_velocity) && exists(min_velocity) -> default_velocity >= min_velocity;
  exists(default_velocity) && exists(max_velocity) -> default_velocity <= max_velocity;
}
```

This example ensures that if min and max velocities are defined, min must be less than max, and if a default velocity is defined, it must fall within the allowed range.

## Multiple Parameter Dependencies

Complex dependencies involving multiple parameters can be expressed:

```
node type costmap_type {
  optional param rolling_window: bool = false;
  optional param static_map: bool = true;
  optional param width: double;
  optional param height: double;
  optional param resolution: double;
  
} where {
  rolling_window -> !static_map;
  rolling_window -> exists(width) && exists(height) && exists(resolution);
  static_map -> !exists(width) && !exists(height);
}
```

This enforces that the `rolling_window` and `static_map` parameters cannot both be `true`, and if `rolling_window` is `true`, size parameters must be defined, while if `static_map` is `true`, size parameters must not be defined.

## Symbolic Dependencies

ROSpec supports symbolic variables in dependencies:

```
node type controller_type {
  param joint_limits: struct {
    velocity: double where {_ > 0.0};
    acceleration: double where {_ > 0.0};
  };
  
} where {
  exists(x) && joint_limits.acceleration == x * joint_limits.velocity;
}
```

This expresses that there is some relationship between velocity and acceleration limits, even if the exact factor is not specified.

## Connection Dependencies

Dependencies can involve connections between components:

```
node type image_processor_type {
  optional param use_compressed_images: bool = false;
  
  subscribes to camera/image_raw when !use_compressed_images: sensor_msgs/Image;
  subscribes to camera/compressed when use_compressed_images: sensor_msgs/CompressedImage;
}
```

This specifies that the topics subscribed to depend on the value of the `use_compressed_images` parameter.

## Common Use Cases

Parameter dependencies are particularly useful for:

1. **Feature toggles**: When certain parameters are only relevant if a feature is enabled
2. **Algorithm selection**: When different parameters are needed depending on the selected algorithm
3. **Hardware configuration**: When parameter constraints depend on the specific hardware being used
4. **Operational modes**: When different modes require different parameter sets
5. **Safety constraints**: When parameters must satisfy safety-related mathematical relationships

## Verification

ROSpec automatically verifies all parameter dependencies during configuration checking. If a dependency is violated, an error message will clearly identify the issue:

```
Error: Parameter dependency violation in node 'controller':
  Condition 'use_velocity_limits -> exists(max_velocity)' is not satisfied.
  'use_velocity_limits' is 'true', but 'max_velocity' is not defined.
  at system.spec:15:3
```

By expressing parameter dependencies in ROSpec, component writers can ensure that integrators understand and respect the relationships between parameters, leading to fewer misconfigurations and more robust robotic systems.
