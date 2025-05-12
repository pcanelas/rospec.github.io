---
title: Parameter Dependencies
sidebar: home_sidebar
permalink: parameter-dependencies.html
parent: Language
nav_order: 2
summary: Learn how to express and verify relationships between parameters in rospec.
---

(Coming soon)
{: .important }

# Parameter Dependencies in rospec

One of the powerful features of rospec is the ability to express and verify dependencies between parameters. This allows component writers to document and enforce complex relationships that must be maintained for correct operation.

## Basic Dependencies

The most common form of dependency is a simple implication between parameters:

```rospec
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

This example from the AMCL node shows how the meaning and constraints on certain parameters depend on the value of the `laser_model_type` parameter.

## Existence Dependencies

You can use the `exists()` function to check if an optional parameter is defined:

```rospec
node type navigation_stack_type {
  optional param global_planner: string;
  optional param global_planner_frequency: double;
  
} where {
  exists(global_planner) -> exists(global_planner_frequency);
}
```

This ensures that if a global planner is specified, its frequency must also be defined.

## Context Dependencies

rospec allows expressing dependencies between context values and parameters:

```rospec
node type laser_scan_matcher_type {
  context is_simulation: bool;
  optional param use_sim_time: bool = false;
  
} where {
  is_simulation -> use_sim_time;
}
```

This ensures that if the component is deployed in a simulation context, the `use_sim_time` parameter must be `true`.

## Numeric Relationships


This example ensures that if min and max velocities are defined, min must be less than max, and if a default velocity is defined, it must fall within the allowed range.

## Multiple Parameter Dependencies


This enforces that the `rolling_window` and `static_map` parameters cannot both be `true`, and if `rolling_window` is `true`, size parameters must be defined, while if `static_map` is `true`, size parameters must not be defined.

## Symbolic Dependencies

rospec supports symbolic variables in dependencies:
