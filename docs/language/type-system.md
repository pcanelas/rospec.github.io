---
title: Type System
sidebar: home_sidebar
permalink: type-system
parent: Language
nav_order: 6
summary: Understanding the type system in rospec, including basic types, liquid types, and type aliases.
---

# Type System

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
| `t` | message type | `geometry_msgs/Twist`, `sensor_msgs/LaserScan` |

These types correspond to the standard types used in ROS parameter files and message definitions. The sized integer types allow for more precise representation of data that needs specific bit widths, which is common in robotics applications dealing with hardware interfaces and embedded systems.

## Refined Types (Liquid Types)

rospec uses liquid types to express constraints on values:

```rospec
param max_speed: double where {_ >= 0.0 && _ <= 10.0};
param retry_count: int where {_ > 0 && _ < 10};
```

The underscore (`_`) represents the value being constrained. In these examples, the constraints ensure that:
- `max_speed` must be a non-negative value not exceeding 10.0 meters per second, preventing unsafe velocities
- `retry_count` must be a positive integer less than 10, limiting the number of retry attempts

These constraints are checked during system integration, preventing invalid parameter assignments before the system is deployed. This is especially valuable for parameters that have physical implications like speed limits or retry counts that could affect system stability.

## Type Aliases

You can define aliases for types to improve code readability:

```rospec
type alias LaserModelType: Enum[Beam, LikelihoodField, LikelihoodFieldProb];
type alias Meter: double;
type alias Radian: double;
type alias NodeName: string;
```

Type aliases serve several important purposes:
- `LaserModelType` creates an enumeration of valid laser model types used in AMCL (a common localization algorithm), ensuring only valid options are selected
- `Meter` and `Radian` provide semantic meaning to what would otherwise be generic floating-point values, making it clear the expected units of measurement
- `NodeName` documents that a string parameter is specifically intended to hold a node name

These aliases improve the documentation value of the specification while enabling more meaningful type checking. For example, even though `Meter` and `double` are technically compatible, the alias helps readers understand the parameter's expected unit of measurement.

## Enumerations

Enumerations allow restricting a parameter to a specific set of values. For example, the `LaserModelType` enumeration shown earlier limits the parameter to one of three specific values: `Beam`, `LikelihoodField`, or `LikelihoodFieldProb`. This prevents misconfigurations where an invalid model type might be specified.

Enumerations are particularly useful for parameters that have a fixed set of valid options, such as operational modes, algorithm variants, or hardware configurations. They provide both documentation of the valid options and runtime verification that only allowed values are used.

## Message Types

rospec automatically understands standard ROS message types:

```rospec
publishes to cmd_vel: geometry_msgs/Twist;
subscribes to laser_scan: sensor_msgs/LaserScan;
provides service get_map: nav_msgs/GetMap;
```

These message type specifications ensure that components use the correct data formats when communicating. In these examples:
- A component publishes velocity commands using the standard `geometry_msgs/Twist` format
- A component subscribes to laser scan data in the `sensor_msgs/LaserScan` format
- A component provides a map service that uses the `nav_msgs/GetMap` service definition

When integrating components, rospec verifies that publishers and subscribers use compatible message types, preventing data format mismatches that could cause runtime failures.

## Message Alias and Field Specifications

You can define message aliases with field-specific constraints:

```rospec
message alias ImageWith16Encoding: sensor_msgs/Image {
  field header: Header;
  field encoding: ImageEncoding16;
  field data: Millimeter[];
}
```

This allows for more specific type checking when components exchange messages. In this example:
- `ImageWith16Encoding` is a specialized version of the standard `sensor_msgs/Image` message
- It requires the `encoding` field to be one of the values in the `ImageEncoding16` enumeration
- The `data` field must contain values with the `Millimeter` type

This specialization helps prevent subtle misconfigurations in image processing pipelines, where different components might expect specific image encodings. By explicitly declaring these requirements, rospec can verify that components will correctly interpret the image data they receive.

## Optional Types

Parameters can be marked as optional with default values:

```rospec
optional param timeout: double = 30.0;
optional param retry_count: int = 3;
optional param node_name: string = "default_node";
```

Optional parameters do not need to be explicitly specified when creating a node instance, as they have default values. In these examples:
- `timeout` defaults to 30.0 seconds if not specified
- `retry_count` defaults to 3 attempts
- `node_name` defaults to "default_node"

This allows component writers to provide sensible defaults while still giving integrators the flexibility to override them when needed. It also reduces the configuration burden for commonly used components by requiring only non-standard parameters to be explicitly defined.

## Arrays and Collections

rospec supports array types:

```rospec
param gain_values: double[] where {length(_) == 3};
param joint_names: string[];
```

Arrays are used to represent collections of values. In these examples:
- `gain_values` must be an array of exactly 3 double values, typically representing PID controller gains (proportional, integral, derivative)
- `joint_names` is a variable-length array of strings representing robot joint identifiers

The constraint on `gain_values` ensures that all three required gain parameters are provided, preventing incomplete controller configurations. This is a common source of misconfiguration in ROS systems where multi-value parameters must have the correct dimensionality.

## Physical Units

rospec encourages specifying physical units for clarity:

```rospec
type alias Meter: double;
type alias Millimeter: double;
type alias Radian: double;
type alias Degree: double;

param wheel_radius: Meter = 0.1;
param joint_limit: Radian where {_ >= 0.0 && _ <= 3.14159};
```

While rospec doesn't enforce unit compatibility at a physical level, using type aliases for different units improves documentation and helps prevent unit confusion. In these examples:
- `wheel_radius` is clearly specified in meters, with a default value of 0.1 meters
- `joint_limit` is specified in radians, constrained to be between 0 and π

This approach helps address one of the most common sources of bugs in robotics systems: mismatched physical units. Even though `Meter` and `Millimeter` are both represented as `double` internally, the aliases document the expected units for maintainers and integrators.
