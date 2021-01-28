//Imports
  import ejs from "ejs"
  import fs from "fs/promises"
  import path from "path"
  import url from "url"
  import metadata from "../source/app/metrics/metadata.mjs"

//Paths
  const __metrics = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..")
  const __action = path.join(__metrics, "source/app/action")
  const __readme = path.join(__metrics, ".github/readme")

//Load plugins metadata
  const {plugins, templates} = await metadata()

//Build readmes
  {
    //Rendering
      console.log(`Generating README.md`)
      const readme = {
        metrics:await ejs.renderFile(path.join(__readme, "README.md"), {plugins, templates}, {async:true, root:__readme}),
        plugins:await ejs.renderFile(path.join(__readme, "partials/documentation/plugins.md"), {plugins, templates}, {async:true}),
        templates:await ejs.renderFile(path.join(__readme, "partials/documentation/templates.md"), {plugins, templates}, {async:true}),
      }

    //Saving
      await fs.writeFile(path.join(__metrics, "README.md"), readme.metrics)
      await fs.writeFile(path.join(__metrics, "source/plugins/README.md"), readme.plugins)
      await fs.writeFile(path.join(__metrics, "source/templates/README.md"), readme.templates)

  }

//Build action descriptor
  {
    console.log(`Generating action.yml`)
    const action = await ejs.renderFile(path.join(__action, "action.yml"), {plugins}, {async:true})
    await fs.writeFile(path.join(__metrics, "action.yml"), action)
  }
