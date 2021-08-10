//Setup
  export default async function({login, q, imports, graphql, queries, data, account}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.discussions))
            return null

        //Load inputs
        imports.metadata.plugins.discussions.inputs({data, account, q})
        const discussions = {categories:{}}

        //Fetch general statistics
        const stats = Object.fromEntries(Object.entries((await graphql(queries.discussions.statistics({login}))).user).map(([key, value]) => [key, value.totalCount]))
        Object.assign(discussions, stats)

        //Load started discussions
        {
          const fetched = []
          const categories = {}
          let cursor = null
          let pushed = 0
          do {
            console.debug(`metrics/compute/${login}/discussions > retrieving discussions after ${cursor}`)
            const {user:{repositoryDiscussions:{edges = [], nodes = []} = {}}} = await graphql(queries.discussions.categories({login, after:cursor ? `after: "${cursor}"` : ""}))
            cursor = edges?.[edges?.length - 1]?.cursor
            fetched.push(...nodes)
            pushed = nodes.length
            console.debug(`metrics/compute/${login}/discussions > retrieved ${pushed} discussions after ${cursor}`)
          } while ((pushed) && (cursor))

          //Compute favorite category
          for (const category of [...fetched.map(({category:{emoji, name}}) => `${imports.emoji.get(emoji)} ${name}`)])
            categories[category] = (categories[category] ?? 0) + 1
          const categoryEntries = Object.entries(categories).sort((a, b) => b[1] - a[1])
          discussions.categories.stats = Object.fromEntries(categoryEntries)
          discussions.categories.favorite = categoryEntries[0]?.[0] ?? null
        }

        //Results
        return discussions
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }
