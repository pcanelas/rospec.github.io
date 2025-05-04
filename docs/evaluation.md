---
#layout: minimal
title: Evaluation
permalink: questions.html
sidebar: home_sidebar
nav_order: 5
---

# Evaluation of rospec

This page shows the evaluation of misconfigurations that rospec can currently detect or document.

<table>
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
    <tr>
        <td><a href="https://answers.ros.org/question/{{ row.question }}" target="_blank" rel="noopener noreferrer">
        {{ row.question }}
        </a></td>
        <td>
          <div class="misconfig-label-group">
            {% for item in row.misconfiguration %}
              <span class="label-misconfiguration">{{ item }}</span>
            {% endfor %}
          </div>
        </td>
        <td style="text-align: center;">
          <span class="status-pill {% if row.status == 'Documentation' %}status-documentation{% else %}status-detectable{% endif %}">
            {{ row.status }}
          </span>
        </td>
        <td style="text-align: center;">
          {% if row.writer != blank and row.writer != "-" %}
            <details>
              <summary>Show Specification</summary>
              <pre><code class="rospec-code">{{ row.writer | escape }}{% if row.integrator != blank and row.integrator != "-" %}

system {
{{ row.integrator | escape }}
}{% endif %}</code></pre>
            </details>
          {% else %}
            <div style="display: flex; justify-content: center; width: 100%;">-</div>
          {% endif %}
        </td>
    </tr>
    {% endif %}
    {% endfor %}
  </tbody>
</table>