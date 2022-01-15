## 🧩 Plugins

Plugins provide additional content and lets you customize your rendered metrics.

**📦 Maintained by core team**
<% { let previous = null; for (const [plugin, {name, category, authors = []}] of Object.entries(plugins).filter(([key, value]) => (value)&&(value.category !== "community")).sort(([an, a], [bn, b]) => a.category === b.category ? an.localeCompare(bn) : 0)) { %>
<% if (previous !== category) { previous = category -%>
* **<%= `${category.charAt(0).toLocaleUpperCase()}${category.substring(1)}` %>**
<% } -%>
  * [<%- name %>](/source/plugins/<%= plugin %>/README.md)<%# -%>
<% }} %>
**🎲 Maintained by community**
<% { let previous = null; for (const [plugin, {name, category, authors = []}] of Object.entries(plugins).filter(([key, value]) => (value)&&(value.category === "community")).sort(([an, a], [bn, b]) => a.category === b.category ? an.localeCompare(bn) : 0)) { %><%# -%>
* [<%- name %>](/source/plugins/<%= plugin %>/README.md) by <%- authors.map(author => `[@${author}](https://github.com/${author})`).join(" ") %>
<% }} %>