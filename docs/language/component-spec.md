---
title: Component Specification
sidebar: home_sidebar
permalink: component-specification
parent: Language
nav_order: 0
summary: Learn how to write rospec specifications for ROS components.
---

(Work In Progress)
{: .important }

# Component Specifications in rospec

Component specifications define the expected behavior, configuration parameters, and communication interfaces for ROS components. They serve as a formal contract and documentation for component users.

## Node Type Definition

The basic structure for defining a node type in rospec:

```
node type <node_type_name> {
  // Parameters
  param <param_name>: <type> [where {<constraints>}];
  optional param <param_name>: <type> = <default_value>;
  
  // Connections
  publishes to <topic>: <message_type>;
  subscribes to <topic>: <message_type>;
  
  // Services
  provides service <service_name>: <service_type>;
  consumes service <service_name>: <service_type>;
  
  // TF Frames
  broadcast <parent_frame> to <child_frame>;
  listens <parent_frame> to <child_frame>;
  
  // Context
  context <context_name>: <type>;
  
} where {
  // Parameter dependencies
  <dependency_expressions>;
}
```

## Parameters

Parameters are configuration values that affect component behavior.

### Required Parameters

```rospec
param max_speed: double where {_ >= 0.0 && _ <= 10.0};
param frame_id: string;
```

### Optional Parameters with Defaults

```rospec
optional param use_sim_time: bool = false;
optional param retry_count: int = 3;
```

### Parameter Constraints

rospec uses liquid types to express constraints on parameter values:

```rospec
param timeout: double where {_ > 0.0};
param port: int where {_ >= 1024 && _ <= 65535};
param mode: string where {_ in ["fast", "normal", "safe"]};
```

## Connections

Define how nodes communicate through topics:

### Publishers

```rospec
publishes to /cmd_vel: geometry_msgs/Twist;
publishes to /image_raw: sensor_msgs/Image;
```

### Subscribers

```rospec
subscribes to /laser_scan: sensor_msgs/LaserScan;
subscribes to /map: nav_msgs/OccupancyGrid;
```

### Quality of Service (QoS)

```rospec
@qos{sensor_data}
publishes to /camera/image_raw: sensor_msgs/Image;

@qos{reliable_qos}
subscribes to /map: nav_msgs/OccupancyGrid;
```

## Services

Define service providers and consumers:

```rospec
provides service /get_map: nav_msgs/GetMap;
consumes service /set_pose: geometry_msgs/SetPose;
```

## TF Transforms

Specify transform broadcasts and listeners:

```rospec
broadcast map to odom;
broadcast odom to base_link;
listens base_link to camera;
```

## Context Information

Specify deployment context requirements:

```rospec
context distribution: AfterHumbleVersion;
context is_simulation: bool;
```

## Parameter Dependencies

Express relationships between parameters:

```rospec
node type controller_type {
  param max_velocity: double;
  optional param use_limits: bool = false;
  optional param min_velocity: double = 0.0;
  
} where {
  use_limits -> exists(min_velocity);
  max_velocity > min_velocity;
}
```

## Plugin Types

Define pluggable extensions:

```rospec
plugin type right_arm_type {
  param tip_name: string;
  param root_name: string;
  optional param robot_description: string = "robot_description";
}
```
