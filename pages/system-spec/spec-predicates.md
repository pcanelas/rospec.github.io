---
title: Specification Predicates
last_updated: August 08, 2022
# summary: ""
sidebar: home_sidebar
permalink: spec-predicates.html
folder: system-spec
---


```haskell
expects {
    cmd_vel.linear.x > min_speed,
    cmd_vel.linear.x < max_speed,
}
```

```haskell
ensures {
    cmd_vel.linear.x > min_speed,
    cmd_vel.linear.x < max_speed,
}
```
