---
#layout: minimal
title: Evaluation
permalink: evaluation
sidebar: home_sidebar
nav_order: 5
---

# Evaluation

This page shows the evaluation of misconfigurations that rospec can currently detect or document.

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
            <pre><code class="rospec-code">{{ row.writer | escape }}{% if row.integrator != blank and row.integrator != "-" %}

system {
{{ row.integrator | escape }}
}{% endif %}</code></pre>
        </td>
    </tr>
    {% endif %}
    {% endif %}
    {% endfor %}
  </tbody>
</table>

<!-- Include evaluation.js for toggle functionality -->
<script src="{{ '/assets/js/evaluation.js' | relative_url }}"></script>

<!-- Include the rospec verification script -->
<script src="{{ '/assets/js/rospec-verification.js' | relative_url }}"></script>