# 🧰 Template/Plugin compatibility matrix

<table>
  <tr>
    <th nowrap="nowrap">Template/Plugin</th><%# -%>
    <% for (const [plugin, {name, icon}] of Object.entries(plugins).filter(([key, value]) => (value)&&(!["core"].includes(key))&&(value.category !== "community"))) { %>
    <th nowrap="nowrap" align="center" title="<%= name %>"><%= icon %></th><% } %>
  </tr><%# -%>
  <% for (const [template, {name, readme}] of Object.entries(templates).filter(([key, value]) => (value)&&(!["community"].includes(key)))) { %>
  <tr>
    <td nowrap="nowrap"><%- name %></td><%# -%>
    <% for (const [plugin] of Object.entries(plugins).filter(([key, value]) => (value)&&(!["core"].includes(key))&&(value.category !== "community"))) { %>
    <td nowrap="nowrap" align="center" data-plugin="<%= plugin %>"><%= {true:"✔️", false:"❌", embed:"✓"}[readme.compatibility[plugin]] %></td><% } %>
  </tr><% } %>
  <tr>
    <td colspan="<%= Object.keys(plugins).length %>"></td>
  </tr>
  <tr>
    <th nowrap="nowrap">Mode/Plugin</th><%# -%>
    <% for (const [plugin, {name, icon}] of Object.entries(plugins).filter(([key, value]) => (value)&&(!["core"].includes(key))&&(value.category !== "community"))) { %>
    <th nowrap="nowrap" align="center" title="<%= name %>"><%= icon %></th><% } %>
  </tr><%# -%>
  <% for (const {mode, icon} of [{mode:"user", icon:"👤"}, {mode:"organization", icon:"👥"}, {mode:"repository", icon:"📓"}]) { %>
  <tr>
    <td nowrap="nowrap"><%= icon %> <%- `${mode.charAt(0).toLocaleUpperCase()}${mode.substring(1)}` %></td><%# -%>
    <% for (const [plugin, {supports}] of Object.entries(plugins).filter(([key, value]) => (value)&&(!["core"].includes(key))&&(value.category !== "community"))) {%>
    <td nowrap="nowrap" align="center" data-plugin="<%= plugin %>"><%= supports.includes(mode) ? "✔️" : "❌" %></td><% } %>
  </tr><% } %>
</table>

*Note: **markdown template** can actually render any kind of SVG metrics using [`embed` function](https://github.com/lowlighter/metrics/blob/master/source/templates/markdown/example.md#embedding-svg-metrics)*
