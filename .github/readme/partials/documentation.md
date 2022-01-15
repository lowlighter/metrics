# 📚 Documentation

<% if (/[.]0-beta$/.test(packaged.version)) { %>
> <sup>*⚠️ This is the documentation of **v<%= packaged.version.replace(/[.]0-beta$/, "") %>-beta** (`@master`/`@main` branches) which includes [unreleased features](https://github.com/lowlighter/metrics/compare/latest...master). See documentation for [**v<%= (Number(packaged.version.replace(/[.]0-beta$/, ""))-0.01).toFixed(2).replace(/[.]0/, ".") %>** (`@latest` branch) here](https://github.com/lowlighter/metrics/blob/latest/README.md).*</sup>
<% } %>

<% for (const partial of ["setup", "templates", "plugins", "contributing"]) { %>
<%- await include(`/partials/documentation/${partial}.md`) -%>
<% } %>
