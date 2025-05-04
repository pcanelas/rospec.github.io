---
title: Component Communication
sidebar: home_sidebar
permalink: component-communication.html
parent: Language
summary: Learn how to specify and verify communication between ROS components using rospec.
---

(Coming soon)
{: .important }

# Component Communication in rospec

Effective communication between components is essential for ROS-based systems. rospec provides robust mechanisms to specify and verify various communication patterns, ensuring components are correctly integrated.

## Publisher-Subscriber Communication

The most common communication pattern in ROS is publisher-subscriber, where components exchange messages through named topics.

### Specifying Publishers


### Specifying Subscribers


### Topic Remapping

```rospec
system {
  node instance camera: camera_driver_type {
    param camera_name = "front_camera";
  }
  
  node instance processor: image_processor_type {
    param camera_name = "front_camera";
    
    // Optional remapping if needed
    remap /front_camera/image_raw to /custom_image_topic;
  }
}
```

## Service-Based Communication

Services provide a request-response pattern for synchronous communication.

### Service Providers

```rospec
node type map_server_type {
  provides service /map_server/get_map: nav_msgs/GetMap;
  provides service /map_server/get_map_properties: nav_msgs/GetMapProperties;
}
```

### Service Consumers


### Dynamic Service Names

You can use parameters to dynamically determine service names:

```rospec
node type object_tracker_type {
  param distance_service: string;
  
  consumes service content(distance_service): hector_nav_msgs/GetDistanceToObstacle;
}

system {
  node instance tracker: object_tracker_type {
    param distance_service = "/get_distance_to_obstacle";
  }
}
```

## Action-Based Communication

Actions are used for long-running tasks with feedback and preemption capabilities.

### Action Servers

```rospec
node type move_base_type {
  provides action /move_base: nav_msgs/MoveBase;
  provides action /clear_costmaps: std_msgs/Empty;
}
```

### Action Clients

```rospec
node type mission_executor_type {
  consumes action /move_base: nav_msgs/MoveBase;
  consumes action /clear_costmaps: std_msgs/Empty;
}
```

## Quality of Service (QoS)

ROS 2 introduced Quality of Service settings for fine-grained control of communication properties.

### Defining QoS Policies

```rospec
policy instance sensor_data: qos {
  param depth = 5;
  param reliability = BestEffort;
  param durability = Volatile;
}

policy instance reliable_transient: qos {
  param depth = 10;
  param reliability = Reliable;
  param durability = TransientLocal;
}
```

### Applying QoS to Publishers

```rospec
node type camera_type {
  @qos{sensor_data}
  publishes to /camera/image_raw: sensor_msgs/Image;
  
  @qos{reliable_transient}
  publishes to /camera/camera_info: sensor_msgs/CameraInfo;
}
```

### Applying QoS to Subscribers

```rospec
node type image_processor_type {
  @qos{sensor_data}
  subscribes to /camera/image_raw: sensor_msgs/Image;
  
  @qos{reliable_transient}
  subscribes to /camera/camera_info: sensor_msgs/CameraInfo;
}
```

## Message Type Compatibility

rospec checks that connected components use compatible message types:

```rospec
node type camera_type {
  publishes to /camera/image_raw: sensor_msgs/Image;
}

node type processor_type {
  subscribes to /camera/image_raw: sensor_msgs/CompressedImage;  // Error: Incompatible types
}
```

## Publisher Cardinality

You can specify constraints on the number of publishers or subscribers:

```rospec
node type pose_initializer_type {
  publishes to /initialpose: geometry_msgs/PoseWithCovariance;
}

node type localization_type {
  subscribes to /initialpose: geometry_msgs/PoseWithCovariance
    where {count(publishers(_)) == 1};  // Ensure exactly one publisher
}
```

## Message Field Constraints

rospec allows you to specify constraints on message fields:

```rospec
message alias ValidLaserScan: sensor_msgs/LaserScan {
  field angle_min: float where {_ >= -3.14159 && _ <= 0.0};
  field angle_max: float where {_ >= 0.0 && _ <= 3.14159};
  field range_min: float where {_ >= 0.0};
  field range_max: float where {_ > range_min};
}

node type laser_driver_type {
  publishes to /scan: ValidLaserScan;
}
```

## Verification

rospec automatically verifies communication configurations:

1. **Connection verification**: Ensuring subscribers have corresponding publishers
2. **Message type compatibility**: Checking that connected components use compatible message types
3. **QoS compatibility**: Verifying QoS settings are compatible between publishers and subscribers
4. **Service availability**: Ensuring service clients have corresponding servers
5. **Action availability**: Checking that action clients have matching servers
6. **Field constraints**: Validating message field constraints

By specifying communication patterns in rospec, you can ensure that components are correctly integrated and detect potential communication issues before deployment.
