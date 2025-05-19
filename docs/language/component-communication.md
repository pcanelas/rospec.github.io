---
title: Component Communication
sidebar: home_sidebar
permalink: component-communication
parent: Language
nav_order: 1
summary: Learn how to specify and verify communication between ROS components using rospec.
---

# Component Communication

Communication between components is essential for ROS-based robotic systems.
rospec provides a way to specify and verify various communication patterns, ensuring components are correctly integrated.

## Publisher-Subscriber Communication
The publisher-subscriber pattern is the most common communication mechanism in ROS, where components exchange messages through named topics.

### Publishers
When a component publishes data to a topic, you specify this in rospec using the `publishes to` keyword:

```rospec
node type rgbdslam_type {
    optional param individual_cloud_out_topic: string = "topic_points";
    
    publishes to content(individual_cloud_out_topic): sensor_msgs/PointCloud2;
}
```

In this example, the component publishes point cloud data to a topic whose name is determined by the `individual_cloud_out_topic` parameter.
The `content()` function dynamically resolves the parameter value, allowing configurable topic names.

### Subscribers
For components that receive data from topics, use the `subscribes to` keyword:

```rospec
node type custom_node_type {
    subscribes to /camera/rgb/image_raw: sensor_msgs/Image;
}
```

This specifies that the component subscribes to camera images from the `/camera/rgb/image_raw` topic.

### Publisher-Subscriber Connection Verification
When integrating components, rospec automatically verifies that:

1. For each subscriber, there is at least one matching publisher
2. The message types are compatible between publishers and subscribers
3. Any additional constraints on the connection are satisfied

For instance, you can specify constraints on the number of publishers for a topic:

```rospec
node type openni_node_type {
    publishes to camera/depth/points: sensor_msgs/PointCloud2 where {count(publishers(_)) == 1};
}
```

This constraint ensures that exactly one component publishes to the topic, preventing potential data conflicts.

## Service-Based Communication

Services provide a request-response pattern for synchronous communication between components.

### Service Providers

Components that offer services specify them with the `provides service` keyword:

```rospec
node type hector_map_server_type {
    provides service /hector_map_server/get_distance_to_obstacle: hector_nav_msgs/GetDistanceToObstacle;
}
```

This declares that the component provides a service for getting distances to obstacles.

### Service Consumers

Components that use services declare them with the `consumes service` keyword:

```rospec
node type hector_object_tracker_type {
    optional param distance_to_obstacle_service: string = "get_distance_to_obstacle";
    
    consumes service content(distance_to_obstacle_service): hector_nav_msgs/GetDistanceToObstacle;
}
```

Just like with topics, service names can be configured using parameters and the `content()` function.

## Action-Based Communication

Actions are used for long-running tasks that provide feedback and can be preempted.
They combine elements of both topics and services.

```rospec
message MoveBaseAction {
    request field goal: move_base_msgs/MoveBaseGoal;
    response field result: move_base_msgs/MoveBaseResult;
    feedback field feedback: move_base_msgs/MoveBaseFeedback;
}

node type action_server_type {
    provides service move_base: MoveBaseAction;
}

node type simple_move_type {
    consumes service SimpleActionClient: MoveBaseAction;
}
```

In this example, an action server provides the `move_base` action, which a client can use to request the robot to move to a goal position.

## Topic Remapping

ROS allows remapping topics at runtime to facilitate component reuse.
rospec supports this through the `remap` keyword:

```rospec
system {
    node instance hector_map_server: hector_map_server_type {
        remap /hector_map_server/get_distance_to_obstacle to get_distance_to_obstacle;
    }
}
```

This remaps a service provided by `hector_map_server` to match the name expected by a consumer.

## Quality of Service (QoS)

In ROS 2, Quality of Service settings control properties like reliability, durability, and history of communication channels.
rospec allows specifying and verifying these settings using policies:

```rospec
policy instance depth5qos: qos {
    setting history = KeepLast;
    setting depth = 5;
}

policy instance depth1qos: qos {
    setting history = KeepLast;
    setting depth = 1;
}

node type openni_camera_driver_depth_type {
    @qos{depth1qos}
    publishes to /camera/rgb/image_raw: sensor_msgs/Image;
}

node type custom_node_type {
    @qos{depth5qos}
    subscribes to /camera/rgb/image_raw: sensor_msgs/Image;
}
```

rospec verifies that QoS settings between publishers and subscribers are compatible, detecting potential communication issues before deployment.

## Message Format Policies

Beyond message types, components may have specific requirements for message formats.
For example, a component might require images in a specific color format:

```rospec
policy instance RGB8: color_format {
    setting format = RGB8;
}

policy instance Grayscale: color_format {
    setting format = Grayscale;
}

node type openni_camera_driver_depth_type {
    @color_format{Grayscale}
    publishes to /camera/rgb/image_raw: sensor_msgs/Image;
}

node type custom_node_type {
    @color_format{RGB8}
    subscribes to /camera/rgb/image_raw: sensor_msgs/Image;
}
```

In this example, a misconfiguration would be detected because the component publishes grayscale images while the subscriber expects RGB8 format.

## Message Aliases and Field Constraints

For more precise specifications, rospec allows defining message aliases with field constraints:

```rospec
message alias RestrictedLaserScan: sensor_msgs/LaserScan {
    field angle_min: float where {_ >= -3.14159 && _ <= 0.0};
    field angle_max: float where {_ >= 0.0 && _ <= 3.14159};
    field range_min: float where {_ >= 0.0};
    field range_max: float where {_ > range_min};
}

node type laser_driver_type {
    publishes to /scan: RestrictedLaserScan;
}
```

This ensures that laser scan messages have valid angle ranges and sensible minimum and maximum ranges.
