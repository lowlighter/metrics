//Imports
import fs from "fs/promises"
import fss from "fs"
import paths from "path"
import url from "url"
import metadata from "../source/app/metrics/metadata.mjs"
import yaml from "js-yaml"

//Paths
const __metrics = paths.join(paths.dirname(url.fileURLToPath(import.meta.url)), "..")
const __templates = paths.join(paths.join(__metrics, "source/templates/"))
const __plugins = paths.join(paths.join(__metrics, "source/plugins/"))
const __test_plugins = paths.join(paths.join(__metrics, "tests/plugins"))

//Load plugins metadata
const {plugins, templates} = await metadata({log:false, diff:true})

async function plugin(id) {
  const path = paths.join(__plugins, id)
  const readme = paths.join(path, "README.md")
  const examples = paths.join(path, "examples.yml")
  const tests = paths.join(__test_plugins, `${id}.yml`)
  return {
    readme:{
      path:readme,
      content:`${await fs.readFile(readme)}`
    },
    tests:{
      path:tests
    },
    examples:fss.existsSync(examples) ? yaml.load(await fs.readFile(examples), "utf8") ?? [] : [],
    options:plugins[id].readme.table
  }
}

const secrets = {
  $regex:/\$\{\{\s*secrets\.(?<secret>\w+)\s*\}\}/,
  METRICS_TOKEN:"MOCKED_TOKEN",
  METRICS_BOT_TOKEN:"MOCKED_TOKEN",
  PAGESPEED_TOKEN:"MOCKED_TOKEN",
  SPOTIFY_TOKENS:"MOCKED_CLIENT_ID, MOCKED_CLIENT_SECRET, MOCKED_REFRESH_TOKEN",
  YOUTUBE_MUSIC_TOKENS:"SAPISID=MOCKED_COOKIE; OTHER_PARAM=OTHER_VALUE;",
  LASTFM_TOKEN:"MOCKED_TOKEN",
  NIGHTSCOUT_URL:"https://testapp.herokuapp.com/",
  WAKATIME_TOKEN:"MOCKED_TOKEN",
  WAKATIME_TOKEN_NO_PROJECTS:"MOCKED_TOKEN_NO_PROJECTS",
  TWITTER_TOKEN:"MOCKED_TOKEN",
  RAPIDAPI_TOKEN:"MOCKED_TOKEN",
}

//Plugins
for (const id of Object.keys(plugins)) {
  const {examples, options, readme, tests} = await plugin(id)

  //Plugin readme
  await fs.writeFile(readme.path, readme.content
    .replace(/(<!--examples-->)[\s\S]*(<!--\/examples-->)/g, `$1\n${examples.map(({test, prod, ...step}) => ["```yaml", yaml.dump(step), "```"].join("\n")).join("\n")}\n$2`)
    .replace(/(<!--options-->)[\s\S]*(<!--\/options-->)/g, `$1\n${options}\n$2`)
  )
  //Plugin tests
  await fs.writeFile(tests.path, yaml.dump(examples.map(({prod, test = {}, name = "", ...step}) => {
    if (test.skip)
      return null
    const result = {name:`${plugins[id].name} - ${name}`, ...step, ...test}
    test.with ??= {}
    for (const [k, v] of Object.entries(result.with)) {
      if (k in test.with)
        result.with[k] = test.with[k]
      if (secrets.$regex.test(v))
        result.with[k] = v.replace(secrets.$regex, secrets[v.match(secrets.$regex)?.groups?.secret])
    }
    if (!result.with.base)
      delete result.with.base
    delete result.with.filename
    return result
  }).filter(t => t)))

}

//Templates

//Workflow