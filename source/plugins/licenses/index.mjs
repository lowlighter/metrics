//Setup
  export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.licenses))
            return null

        //Load inputs
          let {setup, ratio, legal} = imports.metadata.plugins.licenses.inputs({data, account, q})

        //Initialization
          const {user:{repository}} = await graphql(queries.licenses.repository({owner:data.repo.owner.login, name:data.repo.name, account}))
          const result = {ratio, legal, default:repository.licenseInfo, licensed:{available:false}, text:{}, list:[], used:{}, dependencies:0, known:0, unknown:0}
          const {used, text} = result

        //Register existing licenses properties
          const licenses = Object.fromEntries((await graphql(queries.licenses())).licenses.map(license => [license.key, license]))
          for (const license of Object.values(licenses))
            [...license.limitations, ...license.conditions, ...license.permissions].flat().map(({key, label}) => text[key] = label)

        //Check if licensed exists
          if (await imports.which("github-licensed")) {
            //Setup for licensed
              console.debug(`metrics/compute/${login}/plugins > licenses > searching dependencies licenses using licensed`)
              const path = imports.paths.join(imports.os.tmpdir(), `${repository.databaseId}`)
              //Create temporary directory
                console.debug(`metrics/compute/${login}/plugins > licenses > creating temp dir ${path}`)
                await imports.fs.mkdir(path, {recursive:true})
              //Clone repository
                console.debug(`metrics/compute/${login}/plugins > licenses > cloning temp git repository ${repository.url} to ${path}`)
                const git = imports.git(path)
                await git.clone(repository.url, path)
              //Run setup
                console.debug(`metrics/compute/${login}/plugins > licenses > running setup [${setup}]`)
                await imports.run(setup, {cwd:path}, {prefixed:false})
              //Create configuration file
                console.debug(`metrics/compute/${login}/plugins > licenses > building .licensed.yml configuration file`)
                await imports.fs.writeFile(imports.paths.join(path, ".licensed.yml"), [
                  "source_path: .",
                  "cache_path: .licensed",
                ].join("\n"))
            //Spawn licensed process
              console.debug(`metrics/compute/${login}/plugins > licenses > running licensed`)
              //;(await imports.run("github-licensed", {cwd:path}))
            //Cleaning
              console.debug(`metrics/compute/${login}/plugins > licensed > cleaning temp dir ${path}`)
              await imports.fs.rmdir(path, {recursive:true})
          }
          else
            console.debug(`metrics/compute/${login}/plugins > licenses > licensed not available`)

        //List licenses properties
          console.debug(`metrics/compute/${login}/plugins > licenses > compute licenses properties`)
          const base = {permissions:new Set(), limitations:new Set(), conditions:new Set()}
          const combined = {permissions:new Set(), limitations:new Set(), conditions:new Set()}
          for (const properties of Object.keys(base)) {
            //Base license
              if (repository.licenseInfo)
                licenses[repository.licenseInfo.key]?.[properties]?.map(({key}) => base[properties].add(key))
            //Combined licenses
              for (const {key} of result.list)
                licenses[key]?.[properties]?.map(({key}) => combined[properties].add(key))
          }

        //Merge limitations and conditions
          for (const properties of ["limitations", "conditions"])
            result[properties] = [[...base[properties]].map(key => ({key, text:text[key], inherited:false})), [...combined[properties]].filter(key => !base[properties].has(key)).map(key => ({key, text:text[key], inherited:true}))].flat()
        //Remove base permissions conflicting with inherited limitations
          result.permissions = [...base.permissions].filter(key => !combined.limitations.has(key)).map(key => ({key, text:text[key]}))

        //Count used licenses
          console.debug(`metrics/compute/${login}/plugins > licenses > computing ratio`)
          for (const license of [...(repository.licenseInfo ? [repository.licenseInfo] : []), ...result.list])
            used[license.key] = (used[license.key] ?? 0) + 1
          const total = Object.values(used).reduce((a, b) => a + b, 0)
        //Format used licenses and compute positions
          const list = Object.entries(used).sort(([_an, a], [_bn, b]) => b - a).map(([key, count]) => ({name:licenses[key]?.nickname ?? licenses[key]?.name ?? licenses[key]?.spdxId ?? null, key, count, value:count/total, x:0, color:"#000000"}))
          for (let i = 0; i < list.length; i++)
            list.x = (list[i-1]?.x ?? 0) + (list[i-1]?.value ?? 0)
        //Save ratios
          result.list = list

        //Results
          return result
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }
