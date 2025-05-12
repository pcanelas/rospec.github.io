---
title: Examples
sidebar: home_sidebar
permalink: examples
nav_order: 4
summary: Real-world examples of rospec specifications for common ROS components and systems.
---

# Examples

This page provides examples of rospec specifications from ROS Answers/Robotics StackExchange to help you understand how to apply rospec to real-world ROS components and systems.

## Basic Node Type

```rospec
node type laser_scan_matcher_type {
    context is_simulation: bool;

    optional param use_sim_time: bool = false;

    broadcast world to base_link;
    listens base_link to laser;
} where {
    is_simulation -> use_sim_time;
}
```


## Publisher-Subscriber

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
```

The system integration would look like:

```rospec
system {
    node instance hector_object_tracker: hector_object_tracker_type {
        param distance_to_obstacle_service = "get_distance_to_obstacle";
    }

    node instance hector_map_server: hector_map_server_type {
        remap /hector_map_server/get_distance_to_obstacle to get_distance_to_obstacle;
    }
}
```

## Message Alias

```rospec
type alias ImageEncoding16: Enum[RGB16, RGBA16, BGR16, BGRA16, MONO16, 16UC1,
  16UC2, 16UC3, 16UC4, 16SC1, 16SC2, 16SC3, 16SC4, BAYER_RGGB16,
  BAYER_BGGR16, BAYER_GBRG16, BAYER_GRBG16];

type alias Millimeter: int8;

message alias ImageWith16Encoding: sensor_msgs/Image {
    field header: Header;
    field encoding: ImageEncoding16;
    field data: Millimeter[];
}
```

## Quality of Service (QoS) Example

```rospec
policy instance best_effort_qos5: qos {
    param depth = 5;
    param reliability = BestEffort;
}

node type openni_camera_driver_depth_type {
    optional param depth_registration: bool = true;

    @qos{best_effort_qos5}
    publishes to /camera/rgb/image_raw: GrayScale;
}

node type custom_node_type {
    @qos{reliable_qos5}
    subscribes to /camera/rgb/image_raw: RGB8;
}
```

## Plugin Type & Instance

```rospec
node type arm_kinematics_constraint_aware_type {
    param group: Plugin;
}

plugin type right_arm_type {
    param tip_name: string;
    param root_name: string;
    optional param robot_description: string = "robot_description";
    optional param tf_safety_timeout: Second = 0.0;
}
```
