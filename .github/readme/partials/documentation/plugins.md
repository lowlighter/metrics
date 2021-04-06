## 🧩 Plugins

Plugins are features which provide additional content and lets you customize your rendered metrics.
See their respective documentation for more informations about how to setup them:
<% { let previous = null; for (const [plugin, {name, categorie}] of Object.entries(plugins).filter(([key, value]) => value)) { %>
<% if (previous !== categorie) { previous = categorie -%>
* **<%= `${categorie.charAt(0).toLocaleUpperCase()}${categorie.substring(1)}` %>**
<% } -%>
  * [<%- name %>](/source/plugins/<%= plugin %>/README.md)<%# -%>
<% }} %>
