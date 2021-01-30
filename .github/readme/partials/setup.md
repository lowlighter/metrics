# 📜 How to use?

<% for (const partial of ["action", "shared", "web"]) { -%>
<%- await include(`/partials/setup/${partial}.md`) %>
<% } %>
