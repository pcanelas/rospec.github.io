---
#layout: minimal
title: Evaluation
permalink: questions.html
sidebar: home_sidebar
nav_order: 5
---

Here we have the evaluation of our paper...

<table>
  <thead>
    <tr>
      <th>Question</th>
      <th>Misconfiguration</th>
      <th>Status</th>
      <th>Writer</th>
      <th>Integrator</th>
    </tr>
  </thead>
  <tbody>
    {% for row in site.data.questions %}
    <tr>
        <td><a href="https://answers.ros.org/question/{{ row.question }}" target="_blank" rel="noopener noreferrer">
        {{ row.question }}
        </a></td>
        <td>
          <div class="misconfig-label-group">
            {% for item in row.misconfiguration %}
              <span class="label label-misconfiguration">{{ item }}</span>
            {% endfor %}
          </div>
        </td>
      <td>{{ row.status }}</td>
      <td>
        <details>
          <summary>Show Writer</summary>
          <pre><code>{{ row.writer | escape }}</code></pre>
        </details>
      </td>
      <td>
        <details>
          <summary>Show Integrator</summary>
          <pre><code>{{ row.integrator | escape }}</code></pre>
        </details>
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>
