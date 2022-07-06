//Setup
export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.licenses) || (!imports.metadata.plugins.licenses.extras("enabled", {extras})))
      return null

    //Load inputs
    let {setup, ratio, legal} = imports.metadata.plugins.licenses.inputs({data, account, q})

    //Initialization
    const {user: {repository}} = await graphql(queries.licenses.repository({owner: data.repo.owner.login, name: data.repo.name, account}))
    const result = {ratio, legal, default: repository.licenseInfo, licensed: {available: false}, text: {}, list: [], used: {}, dependencies: [], known: 0, unknown: 0}
    const {used, text} = result

    //Register existing licenses properties
    const licenses = Object.fromEntries((await graphql(queries.licenses())).licenses.map(license => [license.key, license]))
    for (const license of Object.values(licenses)) {
      //dprint-ignore
      [...license.limitations, ...license.conditions, ...license.permissions].flat().map(({key, label}) => text[key] = label)
    }
    colors(licenses)

    //Check if licensed exists
    if (await imports.which("licensed")) {
      //Setup for licensed
      console.debug(`metrics/compute/${login}/plugins > licenses > searching dependencies licenses using licensed`)
      const path = imports.paths.join(imports.os.tmpdir(), `${repository.databaseId}`)
      //Create temporary directory
      console.debug(`metrics/compute/${login}/plugins > licenses > creating temp dir ${path}`)
      await imports.fs.rm(path, {recursive: true, force: true})
      await imports.fs.mkdir(path, {recursive: true})
      //Clone repository
      console.debug(`metrics/compute/${login}/plugins > licenses > cloning temp git repository ${repository.url} to ${path}`)
      const git = imports.git(path)
      await git.clone(repository.url, path)
      //Run setup
      if (setup) {
        console.debug(`metrics/compute/${login}/plugins > licenses > running setup [${setup}]`)
        await imports.run(setup, {cwd: path}, {prefixed: false})
      }
      //Create configuration file if needed
      if (!(await imports.fs.stat(imports.paths.join(path, ".licensed.yml")).then(() => 1).catch(() => 0))) {
        console.debug(`metrics/compute/${login}/plugins > licenses > building .licensed.yml configuration file`)
        await imports.fs.writeFile(
          imports.paths.join(path, ".licensed.yml"),
          [
            "cache_path: .licensed",
          ].join("\n"),
        )
      }
      else {
        console.debug(`metrics/compute/${login}/plugins > licenses > a .licensed.yml configuration file already exists`)
      }

      //Spawn licensed process
      console.debug(`metrics/compute/${login}/plugins > licenses > running licensed`)
      JSON.parse(await imports.run("licensed list --format=json --licenses", {cwd: path})).apps
        .map(({sources}) =>
          sources?.flatMap(source =>
            source.dependencies?.map(({dependency, license}) => {
              used[license] = (used[license] ?? 0) + 1
              result.dependencies.push(dependency)
              result.known += license in licenses
              result.unknown += !(license in licenses)
            })
          )
        )
      //Cleaning
      console.debug(`metrics/compute/${login}/plugins > licensed > cleaning temp dir ${path}`)
      await imports.fs.rm(path, {recursive: true, force: true})
    }
    else {
      console.debug(`metrics/compute/${login}/plugins > licenses > licensed not available`)
    }

    //List licenses properties
    console.debug(`metrics/compute/${login}/plugins > licenses > compute licenses properties`)
    const base = {permissions: new Set(), limitations: new Set(), conditions: new Set()}
    const combined = {permissions: new Set(), limitations: new Set(), conditions: new Set()}
    const detected = Object.entries(used).map(([key, _value]) => ({key}))
    for (const properties of Object.keys(base)) {
      //Base license
      if (repository.licenseInfo)
        licenses[repository.licenseInfo.key]?.[properties]?.map(({key}) => base[properties].add(key))
      //Combined licenses
      for (const {key} of detected)
        licenses[key]?.[properties]?.map(({key}) => combined[properties].add(key))
    }

    //Merge limitations and conditions
    for (const properties of ["limitations", "conditions"])
      result[properties] = [[...base[properties]].map(key => ({key, text: text[key], inherited: false})), [...combined[properties]].filter(key => !base[properties].has(key)).map(key => ({key, text: text[key], inherited: true}))].flat()
    //Remove base permissions conflicting with inherited limitations
    result.permissions = [...base.permissions].filter(key => !combined.limitations.has(key)).map(key => ({key, text: text[key]}))

    //Count used licenses
    console.debug(`metrics/compute/${login}/plugins > licenses > computing ratio`)
    const total = Object.values(used).reduce((a, b) => a + b, 0)
    //Format used licenses and compute positions
    const list = Object.entries(used).map(([key, count]) => ({name: licenses[key]?.spdxId ?? `${key.charAt(0).toLocaleUpperCase()}${key.substring(1)}`, key, count, value: count / total, x: 0, color: licenses[key]?.color ?? "#6e7681", order: licenses[key]?.order ?? -1})).sort((
      a,
      b,
    ) => a.order === b.order ? b.count - a.count : b.order - a.order)
    for (let i = 0; i < list.length; i++)
      list[i].x = (list[i - 1]?.x ?? 0) + (list[i - 1]?.value ?? 0)
    //Save ratios
    result.list = list

    //Results
    return result
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}

/**Licenses colorizer (based on category) */
function colors(licenses) {
  for (const [license, value] of Object.entries(licenses)) {
    const [permissions, conditions] = [value.permissions, value.conditions].map(properties => properties.map(({key}) => key))
    switch (true) {
      //Other licenses
      case (license === "other"): {
        value.color = "#8b949e"
        value.order = 0
        break
      }
      //Strongly protective licenses and network protective
      case ((conditions.includes("disclose-source")) && (conditions.includes("same-license")) && (conditions.includes("network-use-disclose"))): {
        value.color = "#388bfd"
        value.order = 1
        break
      }
      //Strongly protective licenses
      case ((conditions.includes("disclose-source")) && (conditions.includes("same-license"))): {
        value.color = "#79c0ff"
        value.order = 2
        break
      }
      //Weakly protective licenses
      case ((conditions.includes("disclose-source")) && (conditions.includes("same-license--library"))): {
        value.color = "#7ee787"
        value.order = 3
        break
      }
      //Permissive license
      case ((permissions.includes("private-use")) && (permissions.includes("commercial-use")) && (permissions.includes("modifications")) && (permissions.includes("distribution"))): {
        value.color = "#56d364"
        value.order = 4
        break
      }
      //Unknown
      default: {
        value.color = "#6e7681"
        value.order = -1
      }
    }
  }
}
