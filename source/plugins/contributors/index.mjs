//Setup
export default async function({login, q, imports, data, rest, graphql, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.contributors))
      return null

    //Load inputs
    let {head, base, ignored, contributions, sections, categories} = imports.metadata.plugins.contributors.inputs({data, account, q})
    const repo = {owner: data.repo.owner.login, repo: data.repo.name}
    ignored.push(...data.shared["users.ignored"])

    //Retrieve head and base commits
    console.debug(`metrics/compute/${login}/plugins > contributors > querying api head and base commits`)
    const ref = {
      head: (await graphql(queries.contributors.commit({...repo, expression: head}))).repository.object,
      base: (await graphql(queries.contributors.commit({...repo, expression: base}))).repository.object,
    }

    //Get commit activity
    console.debug(`metrics/compute/${login}/plugins > contributors > querying api for commits between [${ref.base?.abbreviatedOid ?? null}] and [${ref.head?.abbreviatedOid ?? null}]`)
    const commits = []
    for (let page = 1;; page++) {
      console.debug(`metrics/compute/${login}/plugins > contributors > loading page ${page}`)
      try {
        const {data: loaded} = await rest.repos.listCommits({...repo, per_page: 100, page})
        if (loaded.map(({sha}) => sha).includes(ref.base?.oid)) {
          console.debug(`metrics/compute/${login}/plugins > contributors > reached ${ref.base?.oid}`)
          commits.push(...loaded.slice(0, loaded.map(({sha}) => sha).indexOf(ref.base.oid)))
          break
        }
        if (!loaded.length) {
          console.debug(`metrics/compute/${login}/plugins > contributors > no more page to load`)
          break
        }
        commits.push(...loaded.filter(commit => commit?.author?.login))
      }
      catch (error) {
        if (/Git Repository is empty/.test(error))
          break
        throw error
      }
    }

    //Remove commits after head
    const start = Math.max(0, commits.map(({sha}) => sha).indexOf(ref.head?.oid))
    commits.splice(0, start)
    console.debug(`metrics/compute/${login}/plugins > contributors > ${commits.length} commits loaded (${start} removed)`)

    //Compute contributors and contributions
    let contributors = {}
    for (const {author: {login, avatar_url: avatar}, commit: {message = "", author: {email = ""} = {}}} of commits) {
      if ((!login) || (ignored.includes(login)) || (ignored.includes(email))) {
        console.debug(`metrics/compute/${login}/plugins > contributors > ignored contributor "${login}"`)
        continue
      }
      if (!(login in contributors))
        contributors[login] = {avatar: await imports.imgb64(avatar), contributions: 1, pr: []}
      else {
        contributors[login].contributions++
        contributors[login].pr.push(...(message.match(/(?<=[(])#\d+(?=[)])/g) ?? []))
      }
    }
    contributors = Object.fromEntries(Object.entries(contributors).sort(([_an, a], [_bn, b]) => b.contributions - a.contributions))

    //Filter pull requests
    for (const contributor of Object.values(contributors))
      contributor.pr = [...new Set(contributor.pr)]

    //Contributions categories
    const types = Object.fromEntries([...new Set(Object.keys(categories))].map(type => [type, new Set()]))
    if ((sections.includes("categories")) && (extras)) {
      //Temporary directory
      const repository = `${repo.owner}/${repo.repo}`
      const path = imports.paths.join(imports.os.tmpdir(), `${repository.replace(/[^\w]/g, "_")}`)
      console.debug(`metrics/compute/${login}/plugins > contributors > cloning ${repository} to temp dir ${path}`)

      try {
        //Git clone into temporary directory
        await imports.fs.rm(path, {recursive: true, force: true})
        await imports.fs.mkdir(path, {recursive: true})
        const git = await imports.git(path)
        await git.clone(`https://github.com/${repository}`, ".").status()

        //Analyze contributors' contributions
        for (const contributor in contributors) {
          //Load edited files by contributor
          const files = []
          await imports.spawn("git", ["--no-pager", "log", `--author="${contributor}"`, "--regexp-ignore-case", "--no-merges", "--name-only", '--pretty=format:""'], {cwd: path}, {
            stdout(line) {
              if (line.trim().length)
                files.push(line)
            },
          })
          //Search for contributions type in specified categories
          filesloop:
          for (const file of files) {
            for (const [category, globs] of Object.entries(categories)) {
              for (const glob of [globs].flat(Infinity)) {
                if (imports.minimatch(file, glob, {nocase: true})) {
                  types[category].add(contributor)
                  continue filesloop
                }
              }
            }
          }
        }
      }
      catch (error) {
        console.debug(error)
        console.debug(`metrics/compute/${login}/plugins > contributors > an error occured while processing ${repository}`)
      }
      finally {
        //Cleaning
        console.debug(`metrics/compute/${login}/plugins > contributors > cleaning temp dir ${path}`)
        await imports.fs.rm(path, {recursive: true, force: true})
      }
    }

    //Results
    return {head, base, ref, list: contributors, categories: types, contributions, sections}
  }
  //Handle errors
  catch (error) {
    throw {error: {message: "An error occured", instance: error}}
  }
}
