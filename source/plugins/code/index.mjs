//Setup
export default async function({login, q, imports, data, rest, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled)||(!q.code))
      return null

    //Context
    let context = {mode:"user"}
    if (q.repo) {
      console.debug(`metrics/compute/${login}/plugins > code > switched to repository mode`)
      const {owner, repo} = data.user.repositories.nodes.map(({name:repo, owner:{login:owner}}) => ({repo, owner})).shift()
      context = {...context, mode:"repository", owner, repo}
    }

    //Load inputs
    let {load, lines, visibility, skipped} = imports.metadata.plugins.code.inputs({data, q, account})
    skipped.push(...data.shared["repositories.skipped"])
    const pages = Math.ceil(load / 100)

    //Get user recent code
    console.debug(`metrics/compute/${login}/plugins > code > querying api`)
    const events = []
    try {
      for (let page = 1; page <= pages; page++) {
        console.debug(`metrics/compute/${login}/plugins > code > loading page ${page}/${pages}`)
        events.push(...[...await Promise.all([...(context.mode === "repository" ? await rest.activity.listRepoEvents({owner:context.owner, repo:context.repo}) : await rest.activity.listEventsForAuthenticatedUser({username:login, per_page:100, page})).data
          .filter(({type}) => type === "PushEvent")
          .filter(({actor}) => account === "organization" ? true : actor.login?.toLocaleLowerCase() === login.toLocaleLowerCase())
          .filter(({repo:{name:repo}}) => !((skipped.includes(repo.split("/").pop())) || (skipped.includes(repo))))
          .filter(event => visibility === "public" ? event.public : true)
          .flatMap(({payload}) => Promise.all(payload.commits.map(async commit => (await rest.request(commit.url)).data)))])]
          .flat()
          .filter(({parents}) => parents.length <= 1)
          .filter(({author}) => data.shared["commits.authoring"].filter(authoring => author?.login?.toLocaleLowerCase().includes(authoring)||author?.email?.toLocaleLowerCase().includes(authoring)||author?.name?.toLocaleLowerCase().includes(authoring)).length)
        )
      }
    }
    catch {
      console.debug(`metrics/compute/${login}/plugins > code > no more page to load`)
    }
    console.debug(`metrics/compute/${login}/plugins > code > ${events.length} events loaded`)

    //Search for a random snippet
    const files = events
      .flatMap(({sha, commit:{message, url}, files}) => files.map(({filename, status, additions, deletions, patch}) => ({sha, message, filename, status, additions, deletions, patch, repo:url.match(/repos[/](?<repo>[\s\S]+)[/]git[/]commits/)?.groups?.repo})))
      .filter(({patch}) => (patch ? (patch.match(/\n/mg)?.length ?? 1) : Infinity) < lines)
    const snippet = files[Math.floor(Math.random()*files.length)] ?? null
    if (snippet) {
      //Trim common indent from content and change line feed
      if (!snippet.patch.split("\n").shift().endsWith("@@"))
        snippet.patch = snippet.patch.replace(/^(?<coord>@@.*?@@)/, "$<coord>\n")
      const indent = Math.min(...(snippet.patch.match(/^[+-]? +/mg)?.map(indent => (indent.length ?? Infinity) - indent.startsWith("+") - indent.startsWith("-")) ?? [])) || 0
      const content = imports.htmlescape(snippet.patch.replace(/\r\n/mg, "\n").replace(new RegExp(`^([+-]?)${" ".repeat(indent)}`, "mg"), "$1"))

      //Format patch
      snippet.patch = imports.htmlunescape((await imports.highlight(content, "diff")).trim())
    }

    //Results
    return {snippet}
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}