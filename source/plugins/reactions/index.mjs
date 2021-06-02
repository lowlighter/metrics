//Setup
export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.reactions))
      return null

    //Load inputs
    let {limit:_limit1, "limit.issues":_limit2, days, details, display, ignored} = imports.metadata.plugins.reactions.inputs({data, account, q})

    //Load issue comments
    const comments = []
    for (const {type, limit} of [{type:"issueComments", limit:_limit1}, {type:"issues", limit:_limit2}].filter(({limit}) => limit)) {
      let cursor = null, pushed = 0
      const fetched = []
      do {
        //Load issue comments
        console.debug(`metrics/compute/${login}/plugins > reactions > retrieving ${type} after ${cursor}`)
        const {user:{[type]:{edges}}} = await graphql(queries.reactions({login, type, after:cursor ? `after: "${cursor}"` : ""}))
        cursor = edges?.[edges?.length - 1]?.cursor
        //Save issue comments
        const filtered = edges
          .flatMap(({node:{createdAt:created, reactions:{nodes:reactions}}}) => ({created:new Date(created), reactions:reactions.filter(({user = {}}) => !ignored.includes(user.login)).map(({content}) => content)}))
          .filter(comment => Number.isFinite(days) ? comment.created < new Date(Date.now() - days * 24 * 60 * 60 * 1000) : true)
        pushed = filtered.length
        fetched.push(...filtered)
        console.debug(`metrics/compute/${login}/plugins > reactions > currently at ${fetched.length} ${type} comments`)
        //Applying limit
        if ((fetched.length >= limit) || (filtered.length < edges.length)) {
          fetched.splice(limit)
          console.debug(`metrics/compute/${login}/plugins > reactions > keeping only ${fetched.length} ${type} comments`)
        }
      } while ((cursor) && (pushed) && (fetched.length < limit))
      comments.push(...fetched)
    }
    console.debug(`metrics/compute/${login}/plugins > reactions > fetched ${comments.length} comments`)

    //Format reactions list
    const list = {}
    const reactions = comments.flatMap(({reactions}) => reactions)
    for (const reaction of reactions)
      list[reaction] = (list[reaction] ?? 0) + 1
    const max = Math.max(...Object.values(list))
    for (const [key, value] of Object.entries(list))
      list[key] = {value, percentage:value / reactions.length, score:value / (display === "relative" ? max : reactions.length)}

    //Results
    return {list, comments:comments.length, details, days, twemoji:q["config.twemoji"]}
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}
