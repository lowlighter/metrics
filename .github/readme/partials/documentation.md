# 📚 Documentation

<% for (const partial of ["compatibility", "templates", "plugins", "organizations", "contributing"]) { %>
<%- await include(`/partials/documentation/${partial}.md`) -%>
<% } %>
