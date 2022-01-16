## 🖼️ Templates

Templates lets you change general appearance of rendered metrics.

<% for (const [template, {name}] of Object.entries(templates).filter(([key, value]) => value)) { %>
* [<%- name %> <sub>`<%= template %>`</sub>](/source/templates/<%= template %>/README.md)<%# -%>
<% } %>
