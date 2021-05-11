/**
 * Base plugin is a special plugin because of historical reasons.
 * It populates initial data object directly instead of returning a result like others plugins
 */

//Setup
export default async function({login, graphql, data, q, queries, imports}, conf) {
  //Load inputs
  console.debug(`metrics/compute/${login}/base > started`)
  let {repositories, "repositories.forks":_forks, "repositories.affiliations":_affiliations, "repositories.skipped":_skipped} = imports.metadata.plugins.base.inputs({data, q, account:"bypass"}, {repositories:conf.settings.repositories ?? 100})
  const forks = _forks ? "" : ", isFork: false"
  const affiliations = _affiliations?.length ? `, ownerAffiliations: [${_affiliations.map(x => x.toLocaleUpperCase()).join(", ")}]${conf.authenticated === login ? `, affiliations: [${_affiliations.map(x => x.toLocaleUpperCase()).join(", ")}]` : ""}` : ""

  //Skip initial data gathering if not needed
  if (conf.settings.notoken)
    return (postprocess.skip({login, data}), {})

  //Base parts (legacy handling for web instance)
  const defaulted = ("base" in q) ? legacy.converter(q.base) ?? true : true
  for (const part of conf.settings.plugins.base.parts)
    data.base[part] = `base.${part}` in q ? legacy.converter(q[`base.${part}`]) : defaulted

  //Shared options
  data.shared = {"repositories.skipped":_skipped}
  console.debug(`metrics/compute/${login}/base > shared options > ${JSON.stringify(data.shared)}`)

  //Iterate through account types
  for (const account of ["user", "organization"]) {
    try {
      //Query data from GitHub API
      console.debug(`metrics/compute/${login}/base > account ${account}`)
      const queried = await graphql(queries.base[account]({login, "calendar.from":new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), "calendar.to":(new Date()).toISOString(), forks, affiliations}))
      Object.assign(data, {user:queried[account]})
      postprocess?.[account]({login, data})
      //Query repositories from GitHub API
      {
        //Iterate through repositories
        let cursor = null
        let pushed = 0
        do {
          console.debug(`metrics/compute/${login}/base > retrieving repositories after ${cursor}`)
          const {[account]:{repositories:{edges, nodes}}} = await graphql(queries.base.repositories({login, account, after:cursor ? `after: "${cursor}"` : "", repositories:Math.min(repositories, {user:100, organization:25}[account]), forks, affiliations}))
          cursor = edges?.[edges?.length - 1]?.cursor
          data.user.repositories.nodes.push(...nodes)
          pushed = nodes.length
        } while ((pushed) && (cursor) && (data.user.repositories.nodes.length < repositories))
        //Limit repositories
        console.debug(`metrics/compute/${login}/base > keeping only ${repositories} repositories`)
        data.user.repositories.nodes.splice(repositories)
        console.debug(`metrics/compute/${login}/base > loaded ${data.user.repositories.nodes.length} repositories`)
      }
      //Success
      console.debug(`metrics/compute/${login}/base > graphql query > account ${account} > success`)
      console.debug(data)
      return {}
    }
    catch (error) {
      console.debug(`metrics/compute/${login}/base > account ${account} > failed : ${error}`)
      if (/Could not resolve to a User with the login of/.test(error.message)) {
        console.debug(`metrics/compute/${login}/base > got a "user not found" error for account type "${account}" and user "${login}"`)
        console.debug(`metrics/compute/${login}/base > checking next account type`)
        continue
      }
      throw error
    }
  }
  //Not found
  console.debug(`metrics/compute/${login}/base > no more account type`)
  throw new Error("user not found")
}

//Query post-processing
const postprocess = {
  //User
  user({login, data}) {
    console.debug(`metrics/compute/${login}/base > applying postprocessing`)
    data.account = "user"
    Object.assign(data.user, {
      isVerified:false,
    })
  },
  //Organization
  organization({login, data}) {
    console.debug(`metrics/compute/${login}/base > applying postprocessing`)
    data.account = "organization"
    Object.assign(data.user, {
      isHireable:false,
      starredRepositories:{totalCount:0},
      watching:{totalCount:0},
      contributionsCollection:{
        totalRepositoriesWithContributedCommits:0,
        totalCommitContributions:0,
        restrictedContributionsCount:0,
        totalIssueContributions:0,
        totalPullRequestContributions:0,
        totalPullRequestReviewContributions:0,
      },
      calendar:{contributionCalendar:{weeks:[]}},
      repositoriesContributedTo:{totalCount:0},
      followers:{totalCount:0},
      following:{totalCount:0},
      issueComments:{totalCount:0},
      organizations:{totalCount:0},
    })
  },
  //Skip base content query and instantiate an empty user instance
  skip({login, data}) {
    data.user = {}
    for (const account of ["user", "organization"])
      postprocess?.[account]({login, data})
    data.account = "bypass"
    Object.assign(data.user, {
      databaseId:0,
      name:login,
      login,
      createdAt:new Date(),
      avatarUrl:`https://github.com/${login}.png`,
      websiteUrl:null,
      twitterUsername:login,
      repositories:{totalCount:0, totalDiskUsage:0, nodes:[]},
      packages:{totalCount:0},
    })
  },
}

//Legacy functions
const legacy = {
  converter(value) {
    if (/^(?:[Tt]rue|[Oo]n|[Yy]es|1)$/.test(value))
      return true
    if (/^(?:[Ff]alse|[Oo]ff|[Nn]o|0)$/.test(value))
      return false
    if (Number.isFinite(Number(value)))
      return !!(Number(value))
  },
}
