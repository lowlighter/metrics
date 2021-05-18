## 🐙 Features

* Create infographics from **<%= Object.entries(plugins).filter(([key, value]) => (value)&&(!["base", "core"].includes(key))).length %> plugins**, **<%= Object.entries(templates).filter(([key, value]) => (value)&&(!["community"].includes(key))).length %> templates** and **<%= Object.entries(descriptor.inputs).length %> options**!
  * Even more **customization** with [community templates](source/templates/community) or by [forking this repository](https://github.com/lowlighter/metrics/network/members) and editing HTML/CSS/EJS
* Support **users** and **organizations** accounts, and even **repositories**!
* Save your metrics as **images** (SVG, PNG or JPG), **markdown**, **PDF** or **JSON**!
  * Upload them through commits, pull request and gists, or handle output manually
* Test it live on [metrics.lecoq.io](https://metrics.lecoq.io)!
  * Get a quick overview of any user with [✨ metrics insights](https://metrics.lecoq.io/about)
