---
#layout: minimal
title: Evaluation
permalink: evaluation
sidebar: home_sidebar
nav_order: 5
---

# Evaluation

This page shows the evaluation of rospec's ability to detect or document misconfigurations in ROS-based robot software.

## Methodology

Our evaluation analyzed 182 real-world questions from [ROS Answers](https://answers.ros.org/), the previous primary Q&A platform for the ROS community. 
We categorized each question based on whether rospec could:

- **Detectable** the misconfiguration automatically through static analysis.
- **Document** the issue through improved component specification;
- **Not Support** the particular issue (beyond current capabilities);
- **Out of Scope / Missing Context** the issue was not related to misconfiguration or lacked sufficient context for analysis.

For <span class="status-pill status-detectable">Detectable</span> and <span class="status-pill status-documentation">Documentation</span> categories, we created rospec specifications demonstrating how to prevent these real-world problems.

<table class="evaluation-table">
  <thead>
    <tr>
      <th>Question</th>
      <th>Misconfiguration</th>
      <th>Status</th>
      <th>Specification</th>
    </tr>
  </thead>
  <tbody>
    {% for row in site.data.questions %}
    {% if row.status == "Documentation" or row.status == "Detectable" %}
    <tr class="question-row">
        <td>
          <a href="https://answers.ros.org/question/{{ row.question }}" target="_blank" rel="noopener noreferrer">
          {{ row.question }}
          </a>
        </td>
        <td>
          <div class="misconfig-label-group">
            {% for item in row.misconfiguration %}
              <span class="label-misconfiguration">{{ item }}</span>
            {% endfor %}
          </div>
        </td>
        <td>
          <span class="status-pill {% if row.status == 'Documentation' %}status-documentation{% else %}status-detectable{% endif %}">
            {{ row.status }}
          </span>
        </td>
        <td>
          {% if row.writer != blank and row.writer != "-" %}
            <button class="spec-toggle" data-spec-id="{{ row.question }}"><span>Show Specification</span></button>
          {% else %}
            <div style="display: flex; justify-content: center; width: 100%;">-</div>
          {% endif %}
        </td>
    </tr>
    {% if row.writer != blank and row.writer != "-" %}
    <tr id="spec-{{ row.question }}" class="spec-row">
        <td colspan="4">
            <pre><code class="rospec-code">{{ row.specification | escape }}</code></pre>
        </td>
    </tr>
    {% endif %}
    {% endif %}
    {% endfor %}
  </tbody>
</table>

<script src="{{ '/pyodide/pyodide.js' | relative_url }}"></script>

<!-- Include evaluation.js for toggle functionality -->
<script src="{{ '/assets/js/evaluation.js' | relative_url }}"></script>

<!-- Include the rospec verification script -->
<script src="{{ '/assets/js/rospec-verification.js' | relative_url }}"></script>