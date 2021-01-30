## 🧩 Plugins

Plugins are features which provide additional content and lets you customize your rendered metrics.
See their respective documentation for more informations about how to setup them:
<% for (const [plugin, {name}] of Object.entries(plugins).filter(([key, value]) => value)) { %>
* [<%= name %>](/source/plugins/<%= plugin %>/README.md)<%# -%>
<% } %>
