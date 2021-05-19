//Imports
  import ejs from "ejs"
  import fs from "fs/promises"
  import paths from "path"
  import url from "url"
  import sgit from "simple-git"
  import metadata from "../source/app/metrics/metadata.mjs"

//Mode
  const [mode = "dryrun"] = process.argv.slice(2)
  console.log(`Mode: ${mode}`)

//Paths
  const __metrics = paths.join(paths.dirname(url.fileURLToPath(import.meta.url)), "..")
  const __action = paths.join(__metrics, "source/app/action")
  const __web = paths.join(__metrics, "source/app/web")
  const __readme = paths.join(__metrics, ".github/readme")

//Git setup
  const git = sgit(__metrics)
  const staged = new Set()

//Load plugins metadata
  const {plugins, templates, packaged, descriptor} = await metadata({log:false})

//Update generated files
  async function update({source, output, options = {}}) {
    //Regenerate file
      console.log(`Generating ${output}`)
      const content = await ejs.renderFile(source, {plugins, templates, packaged, descriptor}, {async:true, ...options})
    //Save result
      const file = paths.join(__metrics, output)
      await fs.writeFile(file, content)
    //Add to git
      staged.add(file)
  }

//Rendering
  await update({source:paths.join(__readme, "README.md"), output:"README.md", options:{root:__readme}})
  await update({source:paths.join(__readme, "partials/documentation/plugins.md"), output:"source/plugins/README.md"})
  await update({source:paths.join(__readme, "partials/documentation/templates.md"), output:"source/templates/README.md"})
  await update({source:paths.join(__action, "action.yml"), output:"action.yml"})
  await update({source:paths.join(__web, "settings.example.json"), output:"settings.example.json"})

//Commit and push
  if (mode === "publish") {
    console.log(`Pushing staged changes: \n${[...staged].map(file => `  - ${file}`).join("\n")}`)
    const gitted = await git
      .addConfig("user.name", "github-actions[bot]")
      .addConfig("user.email", "41898282+github-actions[bot]@users.noreply.github.com")
      .add([...staged])
      .commit("Auto-regenerate files")
      .push("origin", "master")
    console.log(gitted)
  }
  console.log("Success!")
