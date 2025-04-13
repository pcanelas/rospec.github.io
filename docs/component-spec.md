---
title: Component Specifications
sidebar: home_sidebar
permalink: component-spec.html
summary: Learn how to write ROSpec specifications for ROS components.
---

# Component Specifications in ROSpec

Component specifications define the expected behavior, configuration parameters, and communication interfaces for ROS components. They serve as a formal contract and documentation for component users.

## Node Type Definition

The basic structure for defining a node type in ROSpec:

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

```
param max_speed: double where {_ >= 0.0 && _ <= 10.0};
param frame_id: string;
```

### Optional Parameters with Defaults

```
optional param use_sim_time: bool = false;
optional param retry_count: int = 3;
```

### Parameter Constraints

ROSpec uses liquid types to express constraints on parameter values:

```
param timeout: double where {_ > 0.0};
param port: int where {_ >= 1024 && _ <= 65535};
param mode: string where {_ in ["fast", "normal", "safe"]};
```

## Connections

Define how nodes communicate through topics:

### Publishers

```
publishes to /cmd_vel: geometry_msgs/Twist;
publishes to /image_raw: sensor_msgs/Image;
```

### Subscribers

```
subscribes to /laser_scan: sensor_msgs/LaserScan;
subscribes to /map: nav_msgs/OccupancyGrid;
```

### Quality of Service (QoS)

```
@qos{sensor_data}
publishes to /camera/image_raw: sensor_msgs/Image;

@qos{reliable_qos}
subscribes to /map: nav_msgs/OccupancyGrid;
```

## Services

Define service providers and consumers:

```
provides service /get_map: nav_msgs/GetMap;
consumes service /set_pose: geometry_msgs/SetPose;
```

## TF Transforms

Specify transform broadcasts and listeners:

```
broadcast map to odom;
broadcast odom to base_link;
listens base_link to camera;
```

## Context Information

Specify deployment context requirements:

```
context distribution: AfterHumbleVersion;
context is_simulation: bool;
```

## Parameter Dependencies

Express relationships between parameters:

```
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

```
plugin type right_arm_type {
  param tip_name: string;
  param root_name: string;
  optional param robot_description: string = "robot_description";
}
```

## Examples

### AMCL Node Type

```
node type amcl_type {
  context distribution: AfterHumbleVersion;
  
  param robot_model_type: Enum[DifferentialMotionModel, OmniMotionModel];
  param scan_topic_name: string;
  param map_topic_name: string;
  
  optional param z_hit: double = 0.5;
  optional param laser_model_type: LaserModelType = LikelihoodField;
  
  @qos{sensor_data}
  publishes to particle_cloud: nav2_msgs/ParticleCloud;
  
  @qos{sensor_data_profile}
  subscribes to content(scan_topic_name): RestrictedLaserScan;
  
  @qos{transient_reliable_qos}
  subscribes to content(map_topic_name): nav_msgs/OccupancyGrid;
  
  provides service reinitialize_global_localization: std_srvs/Empty;
  
  broadcast map to odom;
  broadcast odom to base_link;
  
} where {
  laser_model_type == Beam -> z_hit + z_max + z_rand + z_short == 1;
  laser_model_type == LikelihoodField -> z_hit + z_rand == 1;
}
```

This example defines an AMCL node type with parameters, connections, services, and parameter dependencies.
