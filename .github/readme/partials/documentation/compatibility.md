### 🧰 Plugin compatibility matrix

<table>
  <tr>
    <th nowrap="nowrap">Template/Plugin</th><%# -%>
    <% for (const [plugin, {name, icon}] of Object.entries(plugins).filter(([key, value]) => (value)&&(!["core"].includes(key)))) { %>
    <th nowrap="nowrap" align="center" title="<%= name %>"><%= icon %></th><% } %>
  </tr><%# -%>
  <% for (const [template, {name, readme}] of Object.entries(templates).filter(([key, value]) => (value)&&(!["community"].includes(key)))) { %>
  <tr>
    <th nowrap="nowrap"><%- name %></th><%# -%>
    <% for (const [plugin] of Object.entries(plugins).filter(([key, value]) => (value)&&(!["core"].includes(key)))) { %>
    <th nowrap="nowrap" align="center" data-plugin="<%= plugin %>"><%= readme.compatibility[plugin] ? "✔️" : "❌" %></th><% } %>
  </tr><% } %>
</table>

<table>
  <tr>
    <th nowrap="nowrap">Mode/Plugin</th><%# -%>
    <% for (const [plugin, {name, icon}] of Object.entries(plugins).filter(([key, value]) => (value)&&(!["core"].includes(key)))) { %>
    <th nowrap="nowrap" align="center" title="<%= name %>"><%= icon %></th><% } %>
  </tr><%# -%>
  <% for (const mode of ["user", "organization", "repository"]) { %>
  <tr>
    <th nowrap="nowrap"><%- `${mode.charAt(0).toLocaleUpperCase()}${mode.substring(1)}` %></th><%# -%>
    <% for (const [plugin, {supports}] of Object.entries(plugins).filter(([key, value]) => (value)&&(!["core"].includes(key)))) {%>
    <th nowrap="nowrap" align="center" data-plugin="<%= plugin %>"><%= supports.includes(mode) ? "✔️" : "❌" %></th><% } %>
  </tr><% } %>
</table>
