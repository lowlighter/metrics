Generate your metrics that you can embed everywhere, including your GitHub profile readme! It works for both user and organization accounts, and even for repositories!

<table>
  <tr>
    <th align="center">For user accounts</th>
    <th align="center">For organization accounts</th>
  </tr>
  <tr>
    <%- plugins.base.readme.demo?.replace(/<img src=/g, `<img alt="" width="400" src=`) %>
  </tr>
</table>
<% {
  let cell = 0
  const elements = Object.entries(plugins).filter(([key, value]) => (value)&&(!["base", "core"].includes(key)))
%>
<table>
  <tr>
    <th colspan="2" align="center">
      <a href="source/plugins/README.md">🧩 <%= elements.length %> plugins</a>
    </th>
  </tr>
<%  if (elements.length%2)
      elements.push(["", {readme:{demo:`<td align="center"><img width="900" height="1" alt=""></td>`}}])
    for (let i = 0; i < elements.length; i+=2) {
    const cells = [["even", elements[i]], ["odd", elements[i+1]]]
      for (const [cell, [plugin, {name, readme}]] of cells) {
        if (cell === "even") {
-%>
  <tr>
<% } %>    <th><a href="source/plugins/<%= plugin %>/README.md"><%= name -%></a></th>
<%      if (cell === "odd") {
-%>  </tr>
<% }}
      for (const [cell, [plugin, {name, readme}]] of cells) {
        if (cell === "even") {
-%>
  <tr>
<% } %>    <%- readme.demo.replace(/<img src=/g, `<img alt="" width="400" src=`)?.split("\n")?.map((x, i) => i ? `  ${x}` : x)?.join("\n") %>
<%      if (cell === "odd") {
-%>  </tr>
<% }}} -%>
  <tr>
    <th colspan="2" align="center">
      <a href="https://github.com/lowlighter/metrics/projects/1">More to come soon!</a>
    </th>
  </tr>
</table>
<% } %>
<% {
  let cell = 0
  const elements = Object.entries(templates).filter(([key, value]) => value)
%>
<table>
  <tr>
    <th colspan="2" align="center">
      <a href="source/templates/README.md">🖼️ <%= elements.length-1 %> templates</a>
    </th>
  </tr>
<%  if (elements.length%2)
      elements.push(["", {readme:{demo:`<td align="center"><img width="900" height="1" alt=""></td>`}}])
    for (let i = 0; i < elements.length; i+=2) {
    const cells = [["even", elements[i]], ["odd", elements[i+1]]]
      for (const [cell, [template, {name, readme}]] of cells) {
        if (cell === "even") {
-%>
  <tr>
<% } %>    <th><a href="source/templates/<%= template %>/README.md"><%= name -%></a></th>
<%      if (cell === "odd") {
-%>  </tr>
<% }}
    for (const [cell, [template, {name, readme}]] of cells) {
        if (cell === "even") {
-%>
  <tr>
<% } %>    <%- readme.demo.replace(/<img src=/g, `<img alt="" width="400" src=`)?.split("\n")?.map((x, i) => i ? `  ${x}` : x)?.join("\n") %>
<%      if (cell === "odd") {
-%>  </tr>
<% }}} -%>
</table>
<% } %>
