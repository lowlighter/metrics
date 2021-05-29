## 🧩 Plugins

Plugins are features which provide additional content and lets you customize your rendered metrics.
See their respective documentation for more informations about how to setup them:
<% { let previous = null; for (const [plugin, {name, category}] of Object.entries(plugins).filter(([key, value]) => value).sort(([an, a], [bn, b]) => a.category === b.category ? an.localeCompare(bn) : 0)) { %>
<% if (previous !== category) { previous = category -%>
* **<%= `${category.charAt(0).toLocaleUpperCase()}${category.substring(1)}` %>**
<% } -%>
  * [<%- name %>](/source/plugins/<%= plugin %>/README.md)<%# -%>
<% }} %>
