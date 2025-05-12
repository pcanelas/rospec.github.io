---
title: Type System
sidebar: home_sidebar
permalink: type-system
parent: Language
nav_order: 6
summary: Understanding the type system in rospec, including basic types, liquid types, and type aliases.
---

(Coming soon)
{: .important }

# rospec Type System

rospec uses a rich type system built on liquid and dependent types to express constraints and relationships between configuration values. This enables precise specification and verification of component configurations.

## Basic Types

rospec supports the following primitive types:

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

rospec uses liquid types to express constraints on values:

```
param max_speed: double where {_ >= 0.0 && _ <= 10.0};
param retry_count: int where {_ > 0 && _ < 10};
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



## Message Types

rospec automatically understands standard ROS message types:

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


## Optional Types

Parameters can be marked as optional with default values:

```
optional param timeout: double = 30.0;
optional param retry_count: int = 3;
optional param node_name: string = "default_node";
```


## Arrays and Collections

rospec supports array types:

```
param gain_values: double[] where {length(_) == 3};
param joint_names: string[];
```

## Physical Units

rospec encourages specifying physical units for clarity:

```
type alias Meter: double;
type alias Millimeter: double;
type alias Radian: double;
type alias Degree: double;

param wheel_radius: Meter = 0.1;
param joint_limit: Radian where {_ >= 0.0 && _ <= 3.14159};
```
