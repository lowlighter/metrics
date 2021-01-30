## 🖼️ Templates

Templates lets you change general appearance of rendered metrics.
See their respective documentation for more informations about how to setup them:
<% for (const [template, {name}] of Object.entries(templates).filter(([key, value]) => value)) { %>
* [<%= name %>](/source/templates/<%= template %>/README.md)<%# -%>
<% } %>
