Generate metrics that can be embedded everywhere, including your GitHub profile readme! Supports users, organizations, and even repositories!

<table>
  <tr>
    <th align="center">For user accounts</th>
    <th align="center">For organization accounts</th>
  </tr>
  <tr>
    <%- plugins.base.readme.demo?.replace(/<img src=/g, `<img alt="" width="400" src=`) %>
  </tr>
<% {
  let cell = 0
  const elements = Object.entries(plugins).filter(([key, value]) => (value)&&(!["base", "core"].includes(key)&&(value.category !== "community")))
-%>
  <tr>
    <th colspan="2" align="center">
      <h3><a href="/README.md#-plugins">🧩 Customizable with <%= Object.entries(plugins).filter(([key, value]) => (value)&&(!["base", "core"].includes(key))).length %> plugins and <%= Object.entries(descriptor.inputs).length %> options!</a></h3>
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
<% } %>    <th><% if (plugin) { %><a href="source/plugins/<%= plugin %>/README.md"><%= name -%></a><% } %></th>
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
      <a href="/source/plugins/community/README.md">🎲 See also community plugins</a>
    </th>
  </tr>
<% } %>
<% {
  let cell = 0
  const elements = Object.entries(templates).filter(([key, value]) => (value)&&(!["community"].includes(key)))
-%>
  <tr>
    <th colspan="2" align="center">
      <h3><a href="/README.md#%EF%B8%8F-templates">🖼️ And even more with <%= elements.length %>+ templates!</a></h3>
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
<% } %>    <th><a href="/source/templates/<%= template %>/README.md"><%- name -%></a></th>
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
  <tr>
    <th colspan="2"><a href="/source/templates/community/README.md">📕 See also community templates</a></th>
  </tr>
  <tr>
    <th colspan="2"><h2>🦑 Try it now!</h2></th>
  </tr>
  <tr>
    <th><a href="https://metrics.lecoq.io/embed">📊 Metrics embed</a></th>
    <th><a href="https://metrics.lecoq.io/insights">✨ Metrics insights</a></th>
  </tr>
  <tr>
    <td align="center">
      Embed metrics images on your profile or blog!<br>
      Use <a href="https://github.com/marketplace/actions/metrics-embed">GitHub actions</a> for even more features!<br>
      <img src="/.github/readme/imgs/features_embed.gif" width="441">
    </td>
    <td align="center">
      Share your metrics with friends and on social medias!<br>
      No configuration needed!<br>
      <img src="/.github/readme/imgs/features_insights.gif" width="441">
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <b>Power user?</b><br>
      <a href="https://github.com/lowlighter/metrics/fork">Fork this repository</a> and edit HTML, CSS, JS and <a href="https://github.com/mde/ejs">EJS</a> for even more customization!
    </td>
  </tr>
</table>
<% } %>
