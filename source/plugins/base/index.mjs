/**
 * Base plugin is a special plugin because of historical reasons.
 * It populates initial data object directly instead of returning a result like others plugins
 */

//Setup
export default async function({login, graphql, data, q, queries, imports}, conf) {
  //Load inputs
  console.debug(`metrics/compute/${login}/base > started`)
  let {repositories, "repositories.forks":_forks, "repositories.affiliations":_affiliations, "repositories.batch":_batch} = imports.metadata.plugins.base.inputs({data, q, account:"bypass"}, {repositories:conf.settings.repositories ?? 100})
  const forks = _forks ? "" : ", isFork: false"
  const affiliations = _affiliations?.length ? `, ownerAffiliations: [${_affiliations.map(x => x.toLocaleUpperCase()).join(", ")}]${conf.authenticated === login ? `, affiliations: [${_affiliations.map(x => x.toLocaleUpperCase()).join(", ")}]` : ""}` : ""
  console.debug(`metrics/compute/${login}/base > affiliations constraints ${affiliations}`)

  //Skip initial data gathering if not needed
  if (conf.settings.notoken)
    return (postprocess.skip({login, data, imports}), {})

  //Base parts (legacy handling for web instance)
  const defaulted = ("base" in q) ? legacy.converter(q.base) ?? true : true
  for (const part of conf.settings.plugins.base.parts)
    data.base[part] = `base.${part}` in q ? legacy.converter(q[`base.${part}`]) : defaulted

  //Iterate through account types
  for (const account of ["user", "organization"]) {
    try {
      //Query data from GitHub API
      console.debug(`metrics/compute/${login}/base > account ${account}`)
      const queried = await graphql(queries.base[account]({login, "calendar.from":new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), "calendar.to":(new Date()).toISOString(), forks, affiliations}))
      Object.assign(data, {user:queried[account]})
      postprocess?.[account]({login, data})
      //Query repositories from GitHub API
      data.user.repositoriesContributedTo.nodes = data.user.repositoriesContributedTo.nodes ?? []
      for (const type of ({user:["repositories", "repositoriesContributedTo"], organization:["repositories"]}[account] ?? [])) {
        //Iterate through repositories
        let cursor = null
        let pushed = 0
        const options = {repositories:{forks, affiliations, constraints:""}, repositoriesContributedTo:{forks:"", affiliations:"", constraints:", includeUserRepositories: false, contributionTypes: COMMIT"}}[type] ?? null
        do {
          console.debug(`metrics/compute/${login}/base > retrieving ${type} after ${cursor}`)
          const {[account]:{[type]:{edges = [], nodes = []} = {}}} = await graphql(queries.base.repositories({login, account, type, after:cursor ? `after: "${cursor}"` : "", repositories:Math.min(repositories, {user:_batch, organization:Math.min(25, _batch)}[account]), ...options}))
          cursor = edges?.[edges?.length - 1]?.cursor
          data.user[type].nodes.push(...nodes)
          pushed = nodes.length
          console.debug(`metrics/compute/${login}/base > retrieved ${pushed} ${type} after ${cursor}`)
        } while ((pushed) && (cursor) && (data.user.repositories.nodes.length + data.user.repositoriesContributedTo.nodes.length < repositories))
        //Limit repositories
        console.debug(`metrics/compute/${login}/base > keeping only ${repositories} ${type}`)
        data.user[type].nodes.splice(repositories)
        console.debug(`metrics/compute/${login}/base > loaded ${data.user[type].nodes.length} ${type}`)
      }
      //Shared options
      let {"repositories.skipped":skipped, "commits.authoring":authoring} = imports.metadata.plugins.base.inputs({data, q, account:"bypass"})
      data.shared = {"repositories.skipped":skipped, "commits.authoring":authoring, "repositories.batch":_batch}
      console.debug(`metrics/compute/${login}/base > shared options > ${JSON.stringify(data.shared)}`)
      //Success
      console.debug(`metrics/compute/${login}/base > graphql query > account ${account} > success`)
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
  skip({login, data, imports}) {
    data.user = {}
    data.shared = imports.metadata.plugins.base.inputs({data, q:{}, account:"bypass"})
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
      repositoriesContributedTo:{nodes:[]},
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
