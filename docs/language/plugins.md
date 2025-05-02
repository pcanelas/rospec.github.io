---
title: Plugins in rospec
sidebar: home_sidebar
permalink: plugins.html
parent: Language
summary: Learn how to specify and verify plugin configurations in rospec.
---

(Coming soon)
{: .important }

# Plugins in rospec



## Plugin Fundamentals

In ROS, plugins:

- Are dynamically loaded libraries that extend component functionality
- Allow for modular design and flexible configuration
- Are widely used in navigation, perception, and control systems
- Often have their own configuration parameters and requirements
- Can introduce misconfigurations if not properly documented and verified

## Specifying Plugins in rospec

rospec provides a specific syntax for defining plugin types:

```
plugin type right_arm_type {
  param tip_name: string;
  param root_name: string;
  optional param robot_description: string = "robot_description";
  optional param tf_safety_timeout: Second = 0.0;
}
```

Similar to node types, plugin types can include:
- Required and optional parameters with types and constraints
- Connections to topics and services
- TF frame broadcasts and listeners
- Parameter dependencies

## Plugin Usage in Nodes

Nodes can use plugins by declaring parameters of type `Plugin`:

```
node type arm_kinematics_constraint_aware_type {
  param group: Plugin;
}
```

## Instantiating Plugins

When configuring a system, you create plugin instances and assign them to nodes:

```
system {
  plugin instance right_arm: right_arm_type {
    param tip_name = "right_gripper";
    param root_name = "base_link";
  }
  
  node instance arm_kinematics: arm_kinematics_constraint_aware_type {
    param group = right_arm;  // Assigns the plugin to the node
  }
}
```
