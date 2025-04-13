---
title: Plugins in ROSpec
sidebar: home_sidebar
permalink: plugins.html
summary: Learn how to specify and verify plugin configurations in ROSpec.
---

# Plugins in ROSpec

Plugins are a powerful mechanism in ROS that allows developers to dynamically extend the functionality of nodes without modifying their source code. ROSpec provides dedicated syntax for specifying and verifying plugin configurations.

## Plugin Fundamentals

In ROS, plugins:

- Are dynamically loaded libraries that extend component functionality
- Allow for modular design and flexible configuration
- Are widely used in navigation, perception, and control systems
- Often have their own configuration parameters and requirements
- Can introduce misconfigurations if not properly documented and verified

## Specifying Plugins in ROSpec

ROSpec provides a specific syntax for defining plugin types:

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

## Complex Plugin Examples

### Navigation Stack Plugins

The Navigation2 stack in ROS 2 makes extensive use of plugins. Here's how you might specify them in ROSpec:

```
plugin type nav2_planner_type {
  param plugin_name: string;
  param expected_planner_frequency: double where {_ > 0.0};
  
  optional param allow_unknown: bool = true;
  optional param use_astar: bool = false;
  optional param use_final_approach_orientation: bool = true;
}

plugin type nav2_controller_type {
  param plugin_name: string;
  param controller_frequency: double where {_ > 0.0};
  param min_vel_x: double;
  param max_vel_x: double;
  param min_vel_theta: double;
  param max_vel_theta: double;
  
  optional param transform_tolerance: double = 0.1;
} where {
  min_vel_x < max_vel_x;
  min_vel_theta < max_vel_theta;
}

plugin type nav2_recovery_type {
  param plugin_name: string;
  
  optional param recovery_duration: double = 10.0;
}

node type planner_server_type {
  param planner_plugins: string[];
  
  param plugin.NavGrid: Plugin;  // Note the plugin parameter with namespace
}
```

## Plugin Lists and Maps

ROS often uses lists or maps of plugins. ROSpec supports this pattern:

```
node type costmap_type {
  param global_frame: string;
  param robot_base_frame: string;
  
  param plugins: string[];
  
  param plugin.obstacle_layer: Plugin;
  param plugin.inflation_layer: Plugin;
  param plugin.static_layer: Plugin;
} where {
  forall(p in plugins: exists(plugin.[p]));
}
```

This ensures that for each plugin name in the `plugins` list, there is a corresponding plugin parameter.

## Plugin Verification

ROSpec verifies plugin configurations by:

1. **Checking plugin parameters**: Ensuring all required parameters are provided with valid values
2. **Validating plugin assignments**: Ensuring plugins are assigned to compatible node parameters
3. **Verifying plugin dependencies**: Checking relationships between plugin parameters

For example:

```
Error: Plugin 'right_arm' of type 'right_arm_type' is missing required parameter 'tip_name'
  at system.spec:25:3

Error: Type mismatch in plugin 'controller' parameter 'max_vel_x'. Expected 'double', got 'string'
  at system.spec:32:18

Error: Parameter dependency violation in plugin 'controller' of type 'nav2_controller_type':
  Condition 'min_vel_x < max_vel_x' is not satisfied.
  'min_vel_x' is '0.5', 'max_vel_x' is '0.3'
  at system.spec:40:5
```

## Plugin Inheritance

ROSpec supports the concept of plugin inheritance, where plugins can extend other plugins:

```
plugin type controller_base_type {
  param plugin_name: string;
  param controller_frequency: double where {_ > 0.0};
}

plugin type dwa_controller_type extends controller_base_type {
  param sim_time: double where {_ > 0.0};
  param sim_granularity: double where {_ > 0.0};
  param angular_sim_granularity: double where {_ > 0.0};
}

plugin type teb_controller_type extends controller_base_type {
  param optimization_activate: bool = true;
  param max_global_plan_lookahead_dist: double where {_ > 0.0};
}
```

## Plugin Contexts

Plugins can have context requirements, just like nodes:

```
plugin type perception_plugin_type {
  context has_gpu: bool;
  
  optional param use_gpu: bool = false;
} where {
  has_gpu -> use_gpu;
}
```

## Complete Plugin Example

Here's a complete example of plugin usage in a navigation system:

```
// Plugin type definitions
plugin type follow_path_type {
  param plugin_name: string;
  param controller_frequency: double where {_ > 0.0};
  param max_velocity: double[] where {length(_) == 3};
  param min_velocity: double[] where {length(_) == 3};
  param max_acceleration: double[] where {length(_) == 3};
  
  optional param transform_tolerance: double = 0.1;
  optional param goal_checker: string = "general_goal_checker";
} where {
  forall(i in 0..2: max_velocity[i] > min_velocity[i]);
}

plugin type keep_out_filter_type {
  param plugin_name: string;
  param enabled: bool = true;
  param filter_info_topic: string;
  param mask_topic: string;
}

plugin type speed_filter_type {
  param plugin_name: string;
  param enabled: bool = true;
  param filter_info_topic: string;
  param speed_limit_topic: string;
}

// Node type that uses plugins
node type controller_server_type {
  param controller_frequency: double where {_ > 0.0};
  param min_x_velocity_threshold: double;
  param min_y_velocity_threshold: double;
  param min_theta_velocity_threshold: double;
  
  param plugins: string[];
  
  context is_simulation: bool;
} where {
  exists(plugins);
}

// System configuration with plugins
system {
  // Plugin instances
  plugin instance follow_path: follow_path_type {
    param plugin_name = "follow_path";
    param controller_frequency = 20.0;
    param max_velocity = [0.5, 0.0, 1.0];
    param min_velocity = [-0.5, 0.0, -1.0];
    param max_acceleration = [1.0, 0.0, 2.0];
  }
  
  plugin instance keep_out_filter: keep_out_filter_type {
    param plugin_name = "keep_out_filter";
    param enabled = true;
    param filter_info_topic = "costmap_filter_info";
    param mask_topic = "keep_out_mask";
  }
  
  plugin instance speed_filter: speed_filter_type {
    param plugin_name = "speed_filter";
    param enabled = true;
    param filter_info_topic = "speed_filter_info";
    param speed_limit_topic = "speed_limit";
  }
  
  // Node instance that uses plugins
  node instance controller_server: controller_server_type {
    param controller_frequency = 20.0;
    param min_x_velocity_threshold = 0.001;
    param min_y_velocity_threshold = 0.001;
    param min_theta_velocity_threshold = 0.001;
    
    param plugins = ["follow_path", "keep_out_filter", "speed_filter"];
    
    context is_simulation = true;
  }
}
```

## Benefits of Using ROSpec for Plugins

1. **Explicit documentation**: ROSpec provides clear documentation of plugin parameters and constraints
2. **Automatic verification**: Misconfigurations in plugin parameters are detected before deployment
3. **Dependency management**: Relationships between plugin parameters are verified
4. **System integration**: Ensures plugins are correctly integrated with nodes
5. **Contextual validation**: Verifies plugins are used in appropriate contexts

By using ROSpec to specify and verify plugin configurations, you can significantly reduce the complexity and risk of using plugins in your ROS-based system.
