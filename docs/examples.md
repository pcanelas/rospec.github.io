---
title: Examples
sidebar: home_sidebar
permalink: examples
nav_order: 4
summary: Real-world examples of rospec specifications for common ROS components and systems.
---

# Examples

This page provides examples of rospec specifications from ROS Answers/Robotics StackExchange to help you understand how to apply rospec to real-world ROS components and systems.

## Node Definitions with Parameter Dependencies

One of the encountered sources of misconfigurations in ROS is related to the restriction of configuration values. 
In this example from a real ROS Answers question, a motion planning component has parameters with implicit dependencies that aren't enforced in code:

```rospec
node type move_group_type {
    param elbow_joint/max_acceleration: double where {_ >= 0};
    param elbow_joint/min_velocity: double;

    optional param elbow_joint/max_velocity: double = 1.2211;
    optional param elbow_joint/has_velocity_limits: bool = false;
optional param elbow_joint/has_acceleration_limits: bool = false;
} where {
    exists(elbow_joint/max_velocity) -> elbow_joint/has_velocity_limits;
    exists(elbow_joint/max_acceleration) -> elbow_joint/has_acceleration_limits;
}

system {
    node instance move_group: move_group_type {
        param elbow_joint/max_acceleration = 0.0;
        param elbow_joint/min_velocity = 0.0;
        param elbow_joint/max_velocity = 3.14;
    }
}
```

The specification above defines a node type for MoveIt!'s move_group component, which is responsible for motion planning and trajectory execution for robotic manipulators.
Notice how rospec allows the writer to:
1. Specify refinement types like `double where {_ >= 0}` to ensure the acceleration parameter is non-negative;
2. Define a dependency constraint in the `where` clause that requires `has_velocity_limits` to be true whenever `max_velocity` is defined.

When an integrator attempts to create an instance with an invalid configuration, ROSpec can detect the parameter dependency misconfiguration.
This configuration verification fails because `elbow_joint/max_velocity` is defined but `elbow_joint/has_velocity_limits` remains `false` (the default value), violating the dependency constraint.

## Message Type Definitions and Field Semantics
Another common challenge in ROS is understanding message semantics, particularly with image encodings and physical units that aren't explicitly documented.

```rospec
type alias ImageEncoding16: Enum[RGB16, RGBA16, BGR16, BGRA16, MONO16, 16UC1, 16UC2, 16UC3, 16UC4, 
        16SC1, 16SC2, 16SC3, 16SC4, BAYER_RGGB16, BAYER_BGGR16, BAYER_GBRG16, BAYER_GRBG16];

type alias ImageEncoding32: Enum[32SC1, 32SC2, 32SC3, 32SC4, 32FC1, 32FC2, 32FC3, 32FC4];

type alias Meter: int8;
type alias Millimeter: int8;

message alias ImageWith16Encoding: sensor_msgs/Image {
  field header: Header;
  field encoding: ImageEncoding16;
  field data: Millimeter[];
}

message alias ImageWith32Encoding: sensor_msgs/Image {
  field header: Header;
  field encoding: ImageEncoding32;
  field data: Meter[];
}
```

This specification helps document the relationship between image encodings and physical units in the data field. 
In ROS, these fields are typically just strings or arrays of bytes without semantic meaning. 
With rospec, component writers can express these relationships explicitly, allowing the verification that components use compatible message types.

## Publisher-Subscriber and Service Connections

This example demonstrates how rospec specifies connections between components using topics and services.
```rospec
node type hector_object_tracker_type {
    param distance_to_obstacle_service: string;

    subscribes to worldmodel/image_percept: hector_worldmodel_msgs/ImagePercept;
    publishes to visualization_marker: visualization_msgs/Marker;
    consumes service content(distance_to_obstacle_service): hector_nav_msgs/GetDistanceToObstacle;
}

node type hector_map_server_type {
    provides service /hector_map_server/get_distance_to_obstacle: hector_nav_msgs/GetDistanceToObstacle;
}

system {
    node instance hector_object_tracker: hector_object_tracker_type {
        param distance_to_obstacle_service = "get_distance_to_obstacle";
    }
    node instance hector_map_server: hector_map_server_type {
        remap /hector_map_server/get_distance_to_obstacle to get_distance_to_obstacle;
    }
}
```

With this system specification, ROSpec can verify that,

1. The publisher-subscriber connections match in topic names and message types;
2. Services are properly connected via parameter settings and topic remapping;
3. All required subscribers have matching publishers.

## Quality of Service (QoS) Settings

In ROS 2, Quality of Service settings control communication reliability, latency, and resource usage. 
Mismatches in QoS settings can lead to subtle failure modes where components appear connected but don't actually communicate:

```rospec
policy instance best_effort_qos5: qos {
    setting depth = 5;
    setting reliability = BestEffort;
}

node type openni_camera_driver_depth_type {
    optional param depth_registration: bool = true;
    @qos{best_effort_qos5}
    @color_format{Grayscale}
    publishes to /camera/rgb/image_raw: sensor_msgs/Image;
}

node type custom_node_type {
    @qos{reliable_qos5}
    @color_format{RGB8}
    subscribes to /camera/rgb/image_raw: sensor_msgs/Image;
}
```

This specification shows that:

1. The camera driver uses best-effort QoS, meaning it won't resend dropped messages;
2. The custom node requires reliable QoS, expecting all messages to arrive;
3. There's also a color format mismatch (`Grayscale` vs. `RGB8`).

When integrated in a system, rospec would detect both the QoS mismatch and the color format incompatibility.

## TF Transforms and Contextual Information

This example shows how rospec can specify transform frames and contextual requirements.

```rospec
node type laser_scan_matcher_type {
    context is_simulation: bool;
    optional param use_sim_time: bool = false;

    broadcast world to base_link;
    listens base_link to laser;
} where {
    is_simulation -> use_sim_time;
}

system {
    node instance laser_scan_matcher: laser_scan_matcher_type {
        context is_simulation = true;
    }
}
```

This configuration would be invalid because even though `is_simulation` is set to `true`, the `use_sim_time` parameter isn't explicitly set to `true`, violating the dependency constraint.