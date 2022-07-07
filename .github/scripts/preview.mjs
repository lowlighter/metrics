//Imports
import fs from "fs/promises"
import paths from "path"
import url from "url"
import setup from "../../source/app/metrics/setup.mjs"

//Paths
const __metrics = paths.join(paths.dirname(url.fileURLToPath(import.meta.url)), "../..")
const __templates = paths.join(paths.join(__metrics, "source/templates/"))
const __node_modules = paths.join(paths.join(__metrics, "node_modules"))
const __web = paths.join(paths.join(__metrics, "source/app/web/statics"))

const __preview = paths.join(paths.join(__web, "preview"))
const __preview_js = paths.join(__preview, ".js")
const __preview_css = paths.join(__preview, ".css")
const __preview_templates = paths.join(__preview, ".templates")
const __preview_templates_ = paths.join(__preview, ".templates_")

//Extract from web server
const {conf, Templates} = await setup({log: false})
const templates = Object.entries(Templates).map(([name]) => ({name, enabled: true}))
const metadata = Object.fromEntries(
  Object.entries(conf.metadata.plugins)
    .map(([key, value]) => [key, Object.fromEntries(Object.entries(value).filter(([key]) => ["name", "icon", "category", "web", "supports", "scopes"].includes(key)))])
    .map(([key, value]) => [key, key === "core" ? {...value, web: Object.fromEntries(Object.entries(value.web).filter(([key]) => /^config[.]/.test(key)).map(([key, value]) => [key.replace(/^config[.]/, ""), value]))} : value]),
)
const enabled = Object.entries(metadata).filter(([_name, {category}]) => category !== "core").map(([name]) => ({name, category: metadata[name]?.category ?? "community", enabled: true}))

//Directories
await fs.mkdir(__preview, {recursive: true})
await fs.mkdir(__preview_js, {recursive: true})
await fs.mkdir(__preview_css, {recursive: true})
await fs.mkdir(__preview_templates, {recursive: true})
await fs.mkdir(__preview_templates_, {recursive: true})

//Web
fs.copyFile(paths.join(__web, "index.html"), paths.join(__preview, "index.html"))
fs.copyFile(paths.join(__web, "favicon.png"), paths.join(__preview, ".favicon.png"))
fs.copyFile(paths.join(__web, "opengraph.png"), paths.join(__preview, ".opengraph.png"))
//Plugins and templates
fs.writeFile(paths.join(__preview, ".plugins"), JSON.stringify(enabled))
fs.writeFile(paths.join(__preview, ".plugins.base"), JSON.stringify(conf.settings.plugins.base.parts))
fs.writeFile(paths.join(__preview, ".plugins.metadata"), JSON.stringify(metadata))
fs.writeFile(paths.join(__preview, ".templates__"), JSON.stringify(templates))
for (const template in conf.templates) {
  fs.writeFile(paths.join(__preview_templates_, template), JSON.stringify(conf.templates[template]))
  const __partials = paths.join(__templates, template, "partials")
  const __preview_partials = paths.join(__preview_templates, template, "partials")
  await fs.mkdir(__preview_partials, {recursive: true})
  for (const file of await fs.readdir(__partials))
    fs.copyFile(paths.join(__partials, file), paths.join(__preview_partials, file))
}
//Styles
fs.copyFile(paths.join(__web, "style.css"), paths.join(__preview_css, "style.css"))
fs.copyFile(paths.join(__web, "style.vars.css"), paths.join(__preview_css, "style.vars.css"))
fs.copyFile(paths.join(__node_modules, "prismjs/themes/prism-tomorrow.css"), paths.join(__preview_css, "style.prism.css"))
//Scripts
fs.writeFile(paths.join(__preview_js, "app.js"), `${await fs.readFile(paths.join(__web, "app.js"))}`)
fs.copyFile(paths.join(__node_modules, "ejs/ejs.min.js"), paths.join(__preview_js, "ejs.min.js"))
fs.writeFile(paths.join(__preview_js, "faker.min.js"), "import {faker} from '/.js/faker/index.mjs';globalThis.faker=faker;globalThis.placeholder.init(globalThis)")
for (const path of [[], ["locale"]]) {
  await fs.mkdir(paths.join(__preview_js, "faker", ...path), {recursive: true})
  for (const file of await fs.readdir(paths.join(__node_modules, "@faker-js/faker/dist/esm", ...path))) {
    if (file.endsWith(".mjs"))
      fs.copyFile(paths.join(__node_modules, "@faker-js/faker/dist/esm", ...path, file), paths.join(__preview_js, "faker", ...path, file))
  }
}
fs.copyFile(paths.join(__node_modules, "axios/dist/axios.min.js"), paths.join(__preview_js, "axios.min.js"))
fs.copyFile(paths.join(__node_modules, "axios/dist/axios.min.map"), paths.join(__preview_js, "axios.min.map"))
fs.copyFile(paths.join(__node_modules, "vue/dist/vue.min.js"), paths.join(__preview_js, "vue.min.js"))
fs.copyFile(paths.join(__node_modules, "vue-prism-component/dist/vue-prism-component.min.js"), paths.join(__preview_js, "vue.prism.min.js"))
fs.copyFile(paths.join(__node_modules, "vue-prism-component/dist/vue-prism-component.min.js.map"), paths.join(__preview_js, "vue-prism-component.min.js.map"))
fs.copyFile(paths.join(__node_modules, "prismjs/prism.js"), paths.join(__preview_js, "prism.min.js"))
fs.copyFile(paths.join(__node_modules, "prismjs/components/prism-yaml.min.js"), paths.join(__preview_js, "prism.yaml.min.js"))
fs.copyFile(paths.join(__node_modules, "prismjs/components/prism-markdown.min.js"), paths.join(__preview_js, "prism.markdown.min.js"))
fs.copyFile(paths.join(__node_modules, "clipboard/dist/clipboard.min.js"), paths.join(__preview_js, "clipboard.min.js"))
//Meta
fs.writeFile(paths.join(__preview, ".modes"), JSON.stringify(["embed", "insights"]))
fs.writeFile(paths.join(__preview, ".version"), JSON.stringify(`${conf.package.version}-preview`))
fs.writeFile(paths.join(__preview, ".hosted"), JSON.stringify({by: "metrics", link: "https://github.com/lowlighter/metrics"}))
//Embed
{
  const __web_embed = paths.join(paths.join(__web, "embed"))
  const __web_embed_placeholders = paths.join(__web_embed, "placeholders")
  const __preview_embed = paths.join(__preview, "embed")
  const __preview_embed_placeholders = paths.join(__preview, ".placeholders")
  const __preview_embed_js = paths.join(__preview_js, "embed")
  await fs.mkdir(__preview_embed, {recursive: true})
  await fs.mkdir(__preview_embed_placeholders, {recursive: true})
  await fs.mkdir(__preview_embed_js, {recursive: true})
  fs.writeFile(paths.join(__preview_embed, "index.html"), `${await fs.readFile(paths.join(__web_embed, "index.html"))}`)
  fs.writeFile(paths.join(__preview_embed_js, "app.js"), `${await fs.readFile(paths.join(__web_embed, "app.js"))}`)
  fs.writeFile(paths.join(__preview_embed_js, "app.placeholder.js"), `${await fs.readFile(paths.join(__web_embed, "app.placeholder.js"))}`)
  for (const file of await fs.readdir(__web_embed_placeholders))
    fs.copyFile(paths.join(__web_embed_placeholders, file), paths.join(__preview_embed_placeholders, file))
}
//Insights
for (const insights of ["insights", "about"]) {
  const __web_insights = paths.join(paths.join(__web, "insights"))
  const __preview_insights = paths.join(__preview, `${insights}/.statics`)
  await fs.mkdir(__preview_insights, {recursive: true})
  fs.copyFile(paths.join(__web_insights, "index.html"), paths.join(__preview, insights, "index.html"))
  for (const file of await fs.readdir(__web_insights)) {
    if (file !== ".statics")
      fs.copyFile(paths.join(__web_insights, file), paths.join(__preview_insights, file))
  }
}
