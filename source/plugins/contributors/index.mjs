//Setup
export default async function({login, q, imports, data, rest, graphql, queries, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.contributors))
      return null

    //Load inputs
    let {head, base, ignored, contributions} = imports.metadata.plugins.contributors.inputs({data, account, q})
    const repo = {owner:data.repo.owner.login, repo:data.repo.name}

    //Retrieve head and base commits
    console.debug(`metrics/compute/${login}/plugins > contributors > querying api head and base commits`)
    const ref = {
      head:(await graphql(queries.contributors.commit({...repo, expression:head}))).repository.object,
      base:(await graphql(queries.contributors.commit({...repo, expression:base}))).repository.object,
    }

    //Get commit activity
    console.debug(`metrics/compute/${login}/plugins > contributors > querying api for commits between [${ref.base?.abbreviatedOid ?? null}] and [${ref.head?.abbreviatedOid ?? null}]`)
    const commits = []
    for (let page = 1; ; page++) {
      console.debug(`metrics/compute/${login}/plugins > contributors > loading page ${page}`)
      try {
        const {data:loaded} = await rest.repos.listCommits({...repo, per_page:100, page})
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
    for (const {author:{login, avatar_url:avatar}, commit:{message = ""}} of commits) {
      if ((!login) || (ignored.includes(login))) {
        console.debug(`metrics/compute/${login}/plugins > contributors > ignored contributor "${login}"`)
        continue
      }
      if (!(login in contributors))
        contributors[login] = {avatar:await imports.imgb64(avatar), contributions:1, pr:[]}
      else {
        contributors[login].contributions++
        contributors[login].pr.push(...(message.match(/(?<=[(])#\d+(?=[)])/g) ?? []))
      }
    }
    contributors = Object.fromEntries(Object.entries(contributors).sort(([_an, a], [_bn, b]) => b.contributions - a.contributions))

    //Filter pull requests
    for (const contributor of Object.values(contributors))
      contributor.pr = [...new Set(contributor.pr)]

    //Results
    return {head, base, ref, list:contributors, contributions}
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}
