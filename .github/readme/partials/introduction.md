Generate your metrics that you can embed everywhere, including your GitHub profile readme! It works for both user and organization accounts!

<table>
  <tr>
    <th align="center">For user accounts</th>
    <th align="center">For organization accounts</th>
  </tr>
  <tr>
    <%- plugins.base.readme.demo?.replace(/<img src=/g, `<img alt="" width="400" src=`) %>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" align="center">
      <a href="source/plugins">🧩 <%= Object.entries(plugins).length-2 %> plugins</a>
    </th>
  </tr>
  <% { let cell = 0 %>
  <% for (const [plugin, {name, readme}] of Object.entries(plugins).filter(([key, value]) => (value)&&(!["base", "core"].includes(key)))) { %>
    <% if (cell%2 === 0) { %><tr><% } %>
      <th><a href="source/plugins/<%= plugin %>"><%= name -%></a></th>
      <%- readme.demo?.replace(/<img src=/g, `<img alt="" width="400" src=`) -%>
    <% if (cell%2 === 1) { %></tr><% } -%>
  <% cell++ } } -%>
  <tr>
    <th colspan="2" align="center">
      <a href="https://github.com/lowlighter/metrics/projects/1">More to come soon!</a>
    </th>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" align="center">
      <a href="source/plugins">🖼️ <%= Object.entries(templates).length-1 %> templates</a>
    </th>
  </tr>
  <% { let cell = 0 %>
  <% for (const [template, {name, readme}] of Object.entries(templates).filter(([key, value]) => value)) { %>
    <% if (cell%2 === 0) { %><tr><% } %>
      <th><a href="source/templates/<%= template %>"><%= name -%></a></th>
      <%- readme.demo?.replace(/<img src=/g, `<img alt="" width="400" src=`) -%>
    <% if (cell%2 === 1) { %></tr><% } -%>
  <% cell++ } } -%>
</table>
