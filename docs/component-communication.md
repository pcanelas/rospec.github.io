---
title: Component Communication
sidebar: home_sidebar
permalink: component-communication.html
summary: Learn how to specify and verify communication between ROS components using ROSpec.
---

# Component Communication in ROSpec

Effective communication between components is essential for ROS-based systems. ROSpec provides robust mechanisms to specify and verify various communication patterns, ensuring components are correctly integrated.

## Publisher-Subscriber Communication

The most common communication pattern in ROS is publisher-subscriber, where components exchange messages through named topics.

### Specifying Publishers

```
node type camera_driver_type {
  param image_topic: string = "image_raw";
  param camera_name: string = "camera";
  
  publishes to /$(camera_name)/$(image_topic): sensor_msgs/Image;
  publishes to /$(camera_name)/camera_info: sensor_msgs/CameraInfo;
}
```

### Specifying Subscribers

```
node type image_processor_type {
  param image_topic: string = "image_raw";
  param camera_name: string = "camera";
  
  subscribes to /$(camera_name)/$(image_topic): sensor_msgs/Image;
  subscribes to /$(camera_name)/camera_info: sensor_msgs/CameraInfo;
}
```

### Topic Remapping

```
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

```
node type map_server_type {
  provides service /map_server/get_map: nav_msgs/GetMap;
  provides service /map_server/get_map_properties: nav_msgs/GetMapProperties;
}
```

### Service Consumers

```
node type navigation_type {
  param map_service: string = "get_map";
  
  consumes service /map_server/$(map_service): nav_msgs/GetMap;
}
```

### Dynamic Service Names

You can use parameters to dynamically determine service names:

```
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

```
node type move_base_type {
  provides action /move_base: nav_msgs/MoveBase;
  provides action /clear_costmaps: std_msgs/Empty;
}
```

### Action Clients

```
node type mission_executor_type {
  consumes action /move_base: nav_msgs/MoveBase;
  consumes action /clear_costmaps: std_msgs/Empty;
}
```

## Quality of Service (QoS)

ROS 2 introduced Quality of Service settings for fine-grained control of communication properties.

### Defining QoS Policies

```
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

```
node type camera_type {
  @qos{sensor_data}
  publishes to /camera/image_raw: sensor_msgs/Image;
  
  @qos{reliable_transient}
  publishes to /camera/camera_info: sensor_msgs/CameraInfo;
}
```

### Applying QoS to Subscribers

```
node type image_processor_type {
  @qos{sensor_data}
  subscribes to /camera/image_raw: sensor_msgs/Image;
  
  @qos{reliable_transient}
  subscribes to /camera/camera_info: sensor_msgs/CameraInfo;
}
```

## Message Type Compatibility

ROSpec checks that connected components use compatible message types:

```
node type camera_type {
  publishes to /camera/image_raw: sensor_msgs/Image;
}

node type processor_type {
  subscribes to /camera/image_raw: sensor_msgs/CompressedImage;  // Error: Incompatible types
}
```

## Publisher Cardinality

You can specify constraints on the number of publishers or subscribers:

```
node type pose_initializer_type {
  publishes to /initialpose: geometry_msgs/PoseWithCovariance;
}

node type localization_type {
  subscribes to /initialpose: geometry_msgs/PoseWithCovariance
    where {count(publishers(_)) == 1};  // Ensure exactly one publisher
}
```

## Message Field Constraints

ROSpec allows you to specify constraints on message fields:

```
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

## Conditional Connections

Connections can be conditional based on parameter values:

```
node type image_processor_type {
  param use_compressed: bool = false;
  
  subscribes to /camera/image_raw when !use_compressed: sensor_msgs/Image;
  subscribes to /camera/compressed when use_compressed: sensor_msgs/CompressedImage;
}
```

## Complete Communication Example

Here's a complete example of a system with various communication patterns:

```
// Node type definitions
node type camera_driver_type {
  param camera_name: string;
  param frame_id: string;
  
  @qos{sensor_data}
  publishes to /$(camera_name)/image_raw: sensor_msgs/Image;
  
  @qos{reliable_small}
  publishes to /$(camera_name)/camera_info: sensor_msgs/CameraInfo;
  
  provides service /$(camera_name)/set_parameters: rcl_interfaces/SetParameters;
  
  broadcast $(frame_id) to $(camera_name)_optical_frame;
}

node type object_detector_type {
  param camera_name: string;
  param detection_threshold: double where {_ >= 0.0 && _ <= 1.0};
  
  @qos{sensor_data}
  subscribes to /$(camera_name)/image_raw: sensor_msgs/Image;
  
  @qos{reliable_small}
  subscribes to /$(camera_name)/camera_info: sensor_msgs/CameraInfo;
  
  @qos{reliable_large}
  publishes to /detections: vision_msgs/Detection2DArray;
  
  listens $(camera_name)_optical_frame to map;
}

node type robot_controller_type {
  @qos{reliable_large}
  subscribes to /detections: vision_msgs/Detection2DArray;
  
  @qos{command}
  publishes to /cmd_vel: geometry_msgs/Twist;
  
  provides action /follow_object: custom_msgs/FollowObject;
  
  listens map to base_link;
}

// System configuration
system {
  policy instance sensor_data: qos {
    param depth = 5;
    param reliability = BestEffort;
    param durability = Volatile;
  }
  
  policy instance reliable_small: qos {
    param depth = 1;
    param reliability = Reliable;
    param durability = TransientLocal;
  }
  
  policy instance reliable_large: qos {
    param depth = 10;
    param reliability = Reliable;
    param durability = Volatile;
  }
  
  policy instance command: qos {
    param depth = 1;
    param reliability = Reliable;
    param durability = Volatile;
  }
  
  node instance front_camera: camera_driver_type {
    param camera_name = "front_camera";
    param frame_id = "base_link";
  }
  
  node instance object_detector: object_detector_type {
    param camera_name = "front_camera";
    param detection_threshold = 0.7;
  }
  
  node instance controller: robot_controller_type {}
}
```

## Verification

ROSpec automatically verifies communication configurations:

1. **Connection verification**: Ensuring subscribers have corresponding publishers
2. **Message type compatibility**: Checking that connected components use compatible message types
3. **QoS compatibility**: Verifying QoS settings are compatible between publishers and subscribers
4. **Service availability**: Ensuring service clients have corresponding servers
5. **Action availability**: Checking that action clients have matching servers
6. **Field constraints**: Validating message field constraints

By specifying communication patterns in ROSpec, you can ensure that components are correctly integrated and detect potential communication issues before deployment.
