## 🦑 Interested to get your own?

For a fully-featured experience you should use **metrics** as a [GitHub Action](https://github.com/marketplace/actions/metrics-embed), but you can also try it now at [metrics.lecoq.io](https://metrics.lecoq.io/) with your GitHub username!

Choose `📊 Metrics embed` if you want to customize your GitHub profile and `✨ Metrics insights` to get a quick overview of your GitHub statistics:

<table>
  <tr>
    <th><a href="https://metrics.lecoq.io">📊 Metrics embed</a></th>
    <th><a href="https://metrics.lecoq.io/about">✨ Metrics insights</a></th>
  </tr>
  <tr>
    <td align="center">
      Embed metrics images on your profile readme or blog!<br>
      Use GitHub actions for even more features!<br>
      <img src="/.github/readme/imgs/features_embed.gif" width="441">
    </td>
    <td align="center">
      Share your metrics with friends and on social medias!<br>
      No configuration needed!<br>
      <img src="/.github/readme/imgs/features_insights.gif" width="441">
    </td>
  </tr>
</table>

### 🐙 Features

* Create infographics from **<%= Object.entries(plugins).filter(([key, value]) => (value)&&(!["base", "core"].includes(key))).length %> plugins**, **<%= Object.entries(templates).filter(([key, value]) => (value)&&(!["community"].includes(key))).length %> templates** and **<%= Object.entries(descriptor.inputs).length %> options**
  * Even more **customization** with [community templates](source/templates/community) or by [forking this repository](https://github.com/lowlighter/metrics/network/members) and editing HTML/CSS/EJS
* Support **users**, **organizations** and even **repositories**
* Transparent by default so it'll blend well whether light or dark mode is used
* Save your metrics as **images** (SVG, PNG or JPEG), **markdown**, **PDF** or **JSON**
  * Upload them to GitHub through commits, pull requests and gists, or handle renders yourself
* Works either as [GitHub action](https://github.com/marketplace/actions/metrics-embed) or as [web instance](https://metrics.lecoq.io)

