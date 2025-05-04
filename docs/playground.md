---
title: Playground
sidebar: home_sidebar
permalink: playground
summary: Try out rospec syntax in this interactive playground
nav_order: 3
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
    <textarea id="rospecEditor" placeholder="Write your rospec code here..."></textarea>
  </div>
</div>

<script src="{{ '/assets/js/rospec-playground.js' | relative_url }}"></script>