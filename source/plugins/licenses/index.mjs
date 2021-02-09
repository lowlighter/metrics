//Setup
  export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.licenses))
            return null

        //Load inputs
          let {setup} = imports.metadata.plugins.licenses.inputs({data, account, q})

        //Initialization
          const {user:{repository}} = await graphql(queries.licenses.repository({owner:data.repo.owner.login, name:data.repo.name, account}))
          const _result = {licensed:{available:false}}

          const {licenses} = await graphql(queries.licenses())

          console.log(repository, imports.util.inspect(licenses, {depth:1/0}))


        //Check if licensed exists
          if (await imports.which("licensed")) {
            //Setup for licensed
              console.debug(`metrics/compute/${login}/plugins > licenses > searching dependencies licenses using licensed`)
              const path = imports.paths.join(imports.os.tmpdir(), `${repository.databaseId}`)
              //Create temporary directory
                console.debug(`metrics/compute/${login}/plugins > licenses > creating temp dir ${path}`)
                await imports.fs.rmdir(path, {recursive:true})
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
              //;(await imports.run(`${prefix} `, {cwd:path}))
          }
          else
            console.debug(`metrics/compute/${login}/plugins > licenses > licensed not available`)

        //Results
          return {
            total:10,
            dependencies:24,
            list:[
              {name:"MIT", value:0.5, count:10, x:0, color:"#e34c26"},
              {name:"Other", value:0.5, count:10, x:0.5, color:"#384d54"},
            ],
          }
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }
