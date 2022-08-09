---
title: Local Assignments
last_updated: August 08, 2022
# summary: ""
sidebar: home_sidebar
permalink: local-assignments.html
folder: system-spec
---

### Local Assignments

The language allows the creation of local assignments which are used within the specification predicate scope. Local assignments are created using the ```where { ... }``` statement within an expects/ensures specification. Each *where* statement allows the creation of multiple assignments separated by a comma.

Consider the following specification which restricts the *x* linear velocity speed values accepted by the **topic cmd_vel**. 

```haskell
expects {
    cmd_vel.linear.x > min_speed,
    cmd_vel.linear.x < max_speed,
} where {
    min_speed: double := 0.0,
    max_speed: double := 10.0,
    cmd_vel: Twist := topic /cmd_vel,
}
```

The example creates three local assignments that are used within the *expects* specification. The first two expressions, ```min_speed: double := 0.0``` and ```max_speed: double := 10.0```, define two constants which determine the minimum and maximum values allowed to be published to the **topic /cmd_vel**. The last expression, ```cmd_vel: Twist := topic /cmd_vel```, creates an alias to the **topic /cmd_vel** which can be used with the **expects** statement. 

Every expression requires a name, type and a value except for constant expression. The user may define unassigned variables to express dependency between properties.

### Symbolic Constant Variables

```haskell
expects {
    x < cmd_vel.linear.x,
    cmd_vel.linear.y < x,
} where {
    x: double,
    cmd_vel: Twist := topic /cmd_vel,
}
```

The expression ```x: double``` creates a variable with an undefined value. The use of the variable *x* defines a dependency between the ```cmd_vel.linear.x``` and ```cmd_vel.linear.y```, stating that the linear velocity within the x-axis must always be higher than the linear velocity in the y-axis. However, the same property could be defined with the property ```cmd_vel.linear.y < cmd_vel.linear.x```