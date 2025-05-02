---
title: Configuration Verification
sidebar: home_sidebar
permalink: configuration-verification.html
parent: Language
summary: Learn how rospec verifies configurations and detects misconfigurations in ROS-based systems.
---

(Coming soon)
{: .important }

# Configuration Verification with rospec

rospec provides powerful verification capabilities to detect misconfigurations in ROS-based systems before they cause issues during runtime. This page explains the different types of verification performed by rospec and how to interpret the results.

## Verification Process

When you run the rospec verification tool on your specifications, it performs the following checks:

1. **Syntax validation**: Ensures your specifications follow the correct rospec syntax
2. **Type checking**: Verifies that all parameter values match their declared types
3. **Constraint validation**: Checks that parameter values satisfy their constraints
4. **Dependency verification**: Ensures that relationships between parameters are respected
5. **Connection validation**: Verifies that publishers and subscribers are properly connected
6. **QoS compatibility**: Checks that QoS settings are compatible between connected components
7. **TF tree validation**: Ensures the TF tree is properly connected
8. **Context validation**: Verifies that deployment context requirements are met

## Running Verification

To verify your specifications, use the `rospec verify` command:

```bash
# Verify a single file
rospec verify system.spec

# Verify all specification files in a directory
rospec verify path/to/specs/

# Verify and generate a report
rospec verify system.spec --report=report.json
```

## Understanding Verification Results

rospec provides detailed error messages that help you identify and fix misconfigurations. For example:

```
Error: Parameter 'max_velocity' in node 'controller' must be greater than 0.0
  at system.spec:15:18

Error: Required parameter 'map_topic' is missing in node 'amcl'
  at system.spec:23:3

Error: Type mismatch in node 'image_processor'. Expected 'double' for parameter 'timeout', got 'string'
  at system.spec:31:24

Error: Subscriber to topic '/scan' in node 'obstacle_detector' has no matching publisher
  at system.spec:42:5

Error: Incompatible QoS settings for topic '/camera/image_raw':
  Publisher in 'camera_node' uses 'BestEffort' reliability
  Subscriber in 'image_processor' requires 'Reliable' reliability
  at system.spec:52:7
```

## Verification Categories

rospec detects various categories of misconfigurations:

### 1. Argument and Parameter Configurations

- **Type Mismatch**: Parameter values don't match their declared types
- **Bounds Violation**: Parameter values fall outside their specified ranges
- **Missing Required Parameters**: Required parameters not provided
- **Inconsistent Parameters**: Conflicting parameter values

Example:
```
node type controller_type {
  param max_velocity: double where {_ > 0.0};
}

system {
  node instance controller: controller_type {
    param max_velocity = -2.0;  // Error: Bounds violation
  }
}
```

### 2. Component Integration

- **Missing Publishers**: Subscribers without matching publishers
- **Message Type Mismatch**: Incompatible message types between publishers and subscribers
- **Service Provider Missing**: Service consumers without corresponding providers
- **QoS Incompatibility**: Conflicting QoS settings between publishers and subscribers

Example:
```
node type camera_type {
  publishes to /camera/image_raw: sensor_msgs/CompressedImage;
}

node type processor_type {
  subscribes to /camera/image_raw: sensor_msgs/Image;  // Error: Message type mismatch
}
```

### 3. Deployment Context

- **Context Violation**: Component used in an incompatible context
- **TF Tree Disconnection**: Missing transforms in the TF tree
- **Distribution Incompatibility**: Components from incompatible ROS distributions

Example:
```
node type navigation_type {
  context is_simulation: bool;
  
  optional param use_sim_time: bool = false;
} where {
  is_simulation -> use_sim_time;
}

system {
  node instance navigation: navigation_type {
    context is_simulation = true;
    param use_sim_time = false;  // Error: Context dependency violation
  }
}
```