---
title: ROSpec Type System
sidebar: home_sidebar
permalink: type-system.html
summary: Understanding the type system in ROSpec, including basic types, liquid types, and type aliases.
---

# ROSpec Type System

ROSpec uses a rich type system built on liquid and dependent types to express constraints and relationships between configuration values. This enables precise specification and verification of component configurations.

## Basic Types

ROSpec supports the following primitive types:

| Type | Description | Examples |
|------|-------------|----------|
| `bool` | Boolean values | `true`, `false` |
| `int` | Integer values | `-1`, `0`, `42` |
| `int8`, `int16`, `int32`, `int64` | Sized integers | `127`, `-32768` |
| `uint8`, `uint16`, `uint32`, `uint64` | Unsigned integers | `255`, `65535` |
| `float` | Floating-point numbers | `3.14159`, `-0.5` |
| `double` | Double-precision floating point | `1.23456789`, `-2.71828` |
| `string` | Text values | `"robot_name"`, `"base_link"` |

## Refined Types (Liquid Types)

ROSpec uses liquid types to express constraints on values:

```
param max_speed: double where {_ >= 0.0 && _ <= 10.0};
param retry_count: int where {_ > 0 && _ < 10};
param mode: string where {_ in ["manual", "auto", "safe"]};
```

The underscore (`_`) represents the value being constrained.

## Type Aliases

You can define aliases for types to improve code readability:

```
type alias LaserModelType: Enum[Beam, LikelihoodField, LikelihoodFieldProb];
type alias Meter: double;
type alias Radian: double;
type alias NodeName: string;
```

## Enumerations

ROSpec supports enumeration types:

```
type alias RobotMode: Enum[Idle, Manual, Autonomous, Emergency];
type alias JointType: Enum[Revolute, Prismatic, Fixed, Floating, Planar, Spherical];
```

## Message Types

ROSpec automatically understands standard ROS message types:

```
publishes to cmd_vel: geometry_msgs/Twist;
subscribes to laser_scan: sensor_msgs/LaserScan;
provides service get_map: nav_msgs/GetMap;
```

## Message Alias and Field Specifications

You can define message aliases with field-specific constraints:

```
message alias ImageWith16Encoding: sensor_msgs/Image {
  field header: Header;
  field encoding: ImageEncoding16;
  field data: Millimeter[];
}
```

This allows for more specific type checking when components exchange messages.

## Structs

ROSpec supports struct types for complex data:

```
type alias PIDParams: struct {
  kp: double where {_ >= 0.0};
  ki: double where {_ >= 0.0};
  kd: double where {_ >= 0.0};
  i_clamp: double where {_ >= 0.0};
}
```

## Optional Types

Parameters can be marked as optional with default values:

```
optional param timeout: double = 30.0;
optional param retry_count: int = 3;
optional param node_name: string = "default_node";
```

## Dependent Types

ROSpec supports dependent types to express relationships between values:

```
param min_velocity: double where {_ >= 0.0};
param max_velocity: double where {_ > min_velocity};
```

## Arrays and Collections

ROSpec supports array types:

```
param gain_values: double[] where {length(_) == 3};
param joint_names: string[];
```

## Physical Units

ROSpec encourages specifying physical units for clarity:

```
type alias Meter: double;
type alias Millimeter: double;
type alias Radian: double;
type alias Degree: double;

param wheel_radius: Meter = 0.1;
param joint_limit: Radian where {_ >= 0.0 && _ <= 3.14159};
```

## Type Checking

ROSpec performs static type checking to ensure:

1. Parameter values match their declared types
2. Constraints on parameter values are satisfied
3. Dependent constraints between parameters are respected
4. Message types in publisher-subscriber connections are compatible
5. Service types in provider-consumer connections match
6. QoS settings are compatible

## Examples

### Type Aliases for Image Encodings

```
type alias ImageEncoding16: Enum[RGB16, RGBA16, BGR16, BGRA16, MONO16, 16UC1,
  16UC2, 16UC3, 16UC4, 16SC1, 16SC2, 16SC3, 16SC4, BAYER_RGGB16,
  BAYER_BGGR16, BAYER_GBRG16, BAYER_GRBG16];

type alias ImageEncoding32: Enum[32SC1, 32SC2, 32SC3, 32SC4,
  32FC1, 32FC2, 32FC3, 32FC4];

message alias ImageWith16Encoding: sensor_msgs/Image {
  field header: Header;
  field encoding: ImageEncoding16;
  field data: Millimeter[];
}
```

### Robot Controller Parameters

```
type alias ControllerConfig: struct {
  controller_frequency: double where {_ > 0.0 && _ <= 100.0};
  goal_distance_tolerance: Meter where {_ >= 0.0};
  goal_yaw_tolerance: Radian where {_ >= 0.0};
  xy_goal_tolerance: Meter where {_ >= 0.0};
  yaw_goal_tolerance: Radian where {_ >= 0.0};
  transform_tolerance: double where {_ >= 0.0};
}

node type move_base_type {
  param controller_config: ControllerConfig;
}
```

This comprehensive type system allows ROSpec to detect a wide range of potential misconfigurations before they cause problems in deployed systems.
