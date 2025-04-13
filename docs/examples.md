---
title: ROSpec Examples
sidebar: home_sidebar
permalink: examples.html
summary: Real-world examples of ROSpec specifications for common ROS components and systems.
---

# ROSpec Examples

This page provides practical examples of ROSpec specifications to help you understand how to apply ROSpec to real-world ROS components and systems.

## Basic Node Type Example

```
node type laser_scan_matcher_type {
  context is_simulation: bool;
  
  optional param use_sim_time: bool = false;
  
  broadcast world to base_link;
  listens base_link to laser;
  
} where {
  is_simulation -> use_sim_time;
}
```

This example defines a laser scan matcher node type with:
- A context requirement indicating whether it's running in simulation
- An optional parameter with a default value
- TF frame broadcast and listen declarations
- A dependency that enforces use_sim_time must be true in simulation context

## Publisher-Subscriber Example

```
node type hector_object_tracker_type {
  param distance_to_obstacle_service: string;
  
  subscribes to worldmodel/image_percept: hector_worldmodel_msgs/ImagePercept;
  publishes to visualization_marker: visualization_msgs/Marker;
  consumes service content(distance_to_obstacle_service):
    hector_nav_msgs/GetDistanceToObstacle;
}

node type hector_map_server_type {
  provides service /hector_map_server/get_distance_to_obstacle:
    hector_nav_msgs/GetDistanceToObstacle;
}
```

The system integration would look like:

```
system {
  node instance hector_object_tracker: hector_object_tracker_type {
    param distance_to_obstacle_service = "get_distance_to_obstacle";
  }
  
  node instance hector_map_server: hector_map_server_type {
    remap /hector_map_server/get_distance_to_obstacle to get_distance_to_obstacle;
  }
}
```

## Message Alias Example

```
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

```
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

## Plugin Example

```
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

## AMCL Node Example

```
type alias LaserModelType: Enum[Beam, LikelihoodField, LikelihoodFieldProb]

node type amcl_type {
  context distribution: AfterHumbleVersion;
  
  param robot_model_type: Enum[DifferentialMotionModel, OmniMotionModel];
  param scan_topic_name: string;
  param map_topic_name: string;
  
  optional param z_hit: double = 0.5;
  optional param z_max: double = 0.05;
  optional param z_rand: double = 0.5;
  optional param z_short: double = 0.005;
  optional param always_reset_initial_pose: bool = false;
  optional param laser_model_type: LaserModelType = LikelihoodField;
  
  @qos{sensor_data}
  publishes to particle_cloud: nav2_msgs/ParticleCloud;
  
  @qos{sensor_data_profile}
  subscribes to content(scan_topic_name): RestrictedLaserScan;
  
  @qos{system_default_qos}
  subscribes to initialpose: geometry_msgs/PoseWithCovarianceStamped
    where {count(publishers(_)) == 1};
  
  @qos{transient_reliable_qos}
  subscribes to content(map_topic_name): nav_msgs/OccupancyGrid;
  
  provides service reinitialize_global_localization: std_srvs/Empty;
  provides service set_initial_pose: nav2_msgs/SetInitialPose;
  
  broadcast map to odom;
  broadcast odom to base_link;
  broadcast base_link to scan;
  
} where {
  laser_model_type == Beam -> z_hit + z_max + z_rand + z_short == 1;
  laser_model_type == LikelihoodField -> z_hit + z_rand == 1;
  always_reset_initial_pose -> exists(initial_pose);
}
```

## Complete Warehouse Robot Example

```
system {
  node instance amcl: amcl_type {
    param robot_model_type = DifferentialMotionModel;
    param scan_topic_name = "scan";
    param map_topic_name = "map";
    param z_hit = 0.7;
    param z_rand = 0.3;
    param laser_model_type = LikelihoodField;
  }
  
  node instance map_server: map_server_type {
    param map_file = "warehouse_map.yaml";
    param use_sim_time = true;
  }
  
  node instance controller_server: controller_server_type {
    param controller_frequency = 20.0;
    param min_x_velocity_threshold = 0.001;
    param min_y_velocity_threshold = 0.5;
    param min_theta_velocity_threshold = 0.001;
    
    param plugins = ["FollowPath"];
    
    context is_simulation = true;
  }
  
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
  
  node instance planner_server: planner_server_type {
    param planner_plugins = ["GridBased"];
    param use_sim_time = true;
    
    context is_simulation = true;
  }
  
  plugin instance grid_based: grid_based_type {
    param plugin_name = "GridBased";
    param allow_unknown = true;
    param use_astar = false;
    param use_final_approach_orientation = true;
  }
  
  node instance costmap: costmap_type {
    param global_frame = "map";
    param robot_base_frame = "base_link";
    param rolling_window = true;
    param always_send_full_costmap = false;
    param footprint = [[0.12, 0.12], [0.12, -0.12], [-0.12, -0.12], [-0.12, 0.12]];
    
    param plugins = ["obstacle_layer", "inflation_layer"];
    
    context is_simulation = true;
  }
}