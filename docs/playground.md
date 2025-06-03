---
title: Playground
sidebar: home_sidebar
permalink: playground
summary: Try out rospec syntax in this interactive playground
nav_order: 6
---

# Playground
{: .fs-9 }

Try writing rospec specifications and see the verification in action.

<div class="playground-container">
  <div class="editor-toolbar">
    <div class="toolbar-buttons">
      <button id="verifyCode" class="playground-button primary-button">
        <span class="button-icon">✓</span>Verify
      </button>
      <button id="clearEditor" class="playground-button">
        <span class="button-icon">✕</span>Clear
      </button>
    </div>
  </div>
  
  <div id="errorTab" class="error-tab"></div>
  
  <div class="editor-container">
    <textarea id="rospecEditor" placeholder="Write your rospec code here...

# Example: Try this simple specification
node type camera_node_type {
    param frame_rate: double where {_ > 0.0 && _ <= 30.0};  
    publishes to camera/image_raw: sensor_msgs/Image;
}

system {
    node instance main_camera: camera_node_type {
        param frame_rate = 15.0;
    }
}"></textarea>
  </div>
</div>

<!-- Load Pyodide -->
<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>

<!-- Load the updated playground script with Pyodide support -->
<script src="{{ '/assets/js/rospec-playground.js' | relative_url }}"></script>