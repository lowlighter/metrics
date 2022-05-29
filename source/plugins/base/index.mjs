/**
 * Base plugin is a special plugin because of historical reasons.
 * It populates initial data object directly instead of returning a result like others plugins
 */

//Setup
export default async function({login, graphql, rest, data, q, queries, imports}, conf) {
  //Load inputs
  console.debug(`metrics/compute/${login}/base > started`)
  let {indepth, hireable, "repositories.forks": _forks, "repositories.affiliations": _affiliations, "repositories.batch": _batch} = imports.metadata.plugins.base.inputs({data, q, account: "bypass"})
  const extras = conf.settings.extras?.features ?? conf.settings.extras?.default
  const repositories = conf.settings.repositories || 100
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
      const queried = await graphql(queries.base[account]({login}))
      Object.assign(data, {user: queried[account]})
      postprocess?.[account]({login, data})
      try {
        Object.assign(data.user, (await graphql(queries.base[`${account}.x`]({login, account, "calendar.from": new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), "calendar.to": (new Date()).toISOString()})))[account])
        console.debug(`metrics/compute/${login}/base > successfully loaded bulk query`)
      }
      catch {
        console.debug(`metrics/compute/${login}/base > failed to load bulk query, falling back to unit queries`)
        //Query basic fields
        const fields = {
          user: ["packages", "starredRepositories", "watching", "sponsorshipsAsSponsor", "sponsorshipsAsMaintainer", "followers", "following", "issueComments", "organizations", "repositoriesContributedTo(includeUserRepositories: true)"],
          organization: ["packages", "sponsorshipsAsSponsor", "sponsorshipsAsMaintainer", "membersWithRole"],
        }[account] ?? []
        for (const field of fields) {
          try {
            Object.assign(data.user, (await graphql(queries.base.field({login, account, field})))[account])
          }
          catch {
            console.debug(`metrics/compute/${login}/base > failed to retrieve ${field}`)
            data.user[field] = {totalCount: NaN}
          }
        }
        //Query repositories fields
        for (const field of ["totalCount", "totalDiskUsage"]) {
          try {
            Object.assign(data.user.repositories, (await graphql(queries.base["field.repositories"]({login, account, field})))[account].repositories)
          }
          catch (error) {
            console.debug(`metrics/compute/${login}/base > failed to retrieve repositories.${field}`)
            data.user.repositories[field] = NaN
          }
        }
        //Query user account fields
        if (account === "user") {
          //Query contributions collection
          {
            const fields = ["totalRepositoriesWithContributedCommits", "totalCommitContributions", "restrictedContributionsCount", "totalIssueContributions", "totalPullRequestContributions", "totalPullRequestReviewContributions"]
            for (const field of fields) {
              try {
                Object.assign(data.user.contributionsCollection, (await graphql(queries.base.contributions({login, account, field, range: ""})))[account].contributionsCollection)
              }
              catch {
                console.debug(`metrics/compute/${login}/base > failed to retrieve contributionsCollection.${field}`)
                data.user.contributionsCollection[field] = NaN
              }
            }
          }
          //Query calendar
          try {
            Object.assign(data.user, (await graphql(queries.base.calendar({login, "calendar.from": new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), "calendar.to": (new Date()).toISOString()})))[account])
          }
          catch {
            console.debug(`metrics/compute/${login}/base > failed to retrieve contributions calendar`)
            data.user.calendar = {contributionCalendar: {weeks: []}}
          }
        }
      }
      //Query contributions collection over account lifetime instead of last year
      if (account === "user") {
        if ((indepth) && (extras)) {
          const fields = ["totalRepositoriesWithContributedCommits", "totalCommitContributions", "restrictedContributionsCount", "totalIssueContributions", "totalPullRequestContributions", "totalPullRequestReviewContributions"]
          const start = new Date(data.user.createdAt)
          const end = new Date()
          const collection = {}
          for (const field of fields) {
            collection[field] = 0
            //Load contribution calendar
            for (let from = new Date(start); from < end;) {
              //Set date range
              let to = new Date(from)
              to.setUTCHours(+6 * 4 * 7 * 24)
              if (to > end)
                to = end
              //Ensure that date ranges are not overlapping by setting it to previous day at 23:59:59.999
              const dto = new Date(to)
              dto.setUTCHours(-1)
              dto.setUTCMinutes(59)
              dto.setUTCSeconds(59)
              dto.setUTCMilliseconds(999)
              //Fetch data from api
              try {
                console.debug(`metrics/compute/${login}/plugins > base > loading contributions collections for ${field} from "${from.toISOString()}" to "${dto.toISOString()}"`)
                const {[account]: {contributionsCollection}} = await graphql(queries.base.contributions({login, account, field, range: `(from: "${from.toISOString()}", to: "${dto.toISOString()}")`}))
                collection[field] += contributionsCollection[field]
              }
              catch {
                console.debug(`metrics/compute/${login}/plugins > base > failed to load contributions collections for ${field} from "${from.toISOString()}" to "${dto.toISOString()}"`)
              }
              //Set next date range start
              from = new Date(to)
            }
            data.user.contributionsCollection[field] = Math.max(collection[field], data.user.contributionsCollection[field])
          }
        }
        //Fallback to load whole commit history rather than last year
        else {
          try {
            console.debug(`metrics/compute/${login}/base > loading user commits history`)
            const {data: {total_count: total = 0}} = await rest.search.commits({q: `author:${login}`})
            data.user.contributionsCollection.totalCommitContributions = Math.max(total, data.user.contributionsCollection.totalCommitContributions)
          }
          catch {
            console.debug(`metrics/compute/${login}/base > falling back to last year commits history`)
          }
        }
        //Hireable status
        if (hireable) {
          console.debug(`metrics/compute/${login}/base > is hireable`)
          data.user.isHireable = hireable
        }
      }
      //Query repositories from GitHub API
      for (const type of ({user: ["repositories", "repositoriesContributedTo"], organization: ["repositories"]}[account] ?? [])) {
        //Iterate through repositories
        let cursor = null
        let pushed = 0
        const options = {repositories: {forks, affiliations, constraints: ""}, repositoriesContributedTo: {forks: "", affiliations: "", constraints: ", includeUserRepositories: false, contributionTypes: COMMIT"}}[type] ?? null
        data.user[type] = data.user[type] ?? {}
        data.user[type].nodes = data.user[type].nodes ?? []
        do {
          console.debug(`metrics/compute/${login}/base > retrieving ${type} after ${cursor}`)
          const request = {}
          try {
            Object.assign(request, await graphql(queries.base.repositories({login, account, type, after: cursor ? `after: "${cursor}"` : "", repositories: Math.min(repositories, {user: _batch, organization: Math.min(25, _batch)}[account]), ...options})))
          }
          catch (error) {
            console.debug(`metrics/compute/${login}/base > failed to retrieve ${_batch} repositories after ${cursor}, this is probably due to an API timeout, halving batch`)
            _batch = Math.floor(_batch / 2)
            if (_batch < 1) {
              console.debug(`metrics/compute/${login}/base > failed to retrieve repositories, cannot halve batch anymore`)
              throw error
            }
            continue
          }
          const {[account]: {[type]: {edges = [], nodes = []} = {}}} = request
          cursor = edges?.[edges?.length - 1]?.cursor
          data.user[type].nodes.push(...nodes)
          pushed = nodes.length
          console.debug(`metrics/compute/${login}/base > retrieved ${pushed} ${type} after ${cursor}`)
          if (pushed < repositories) {
            console.debug(`metrics/compute/${login}/base > retrieved less repositories than expected, probably no more to fetch`)
            break
          }
        } while ((pushed) && (cursor) && ((data.user.repositories?.nodes?.length ?? 0) + (data.user.repositoriesContributedTo?.nodes?.length ?? 0) < repositories))
        //Limit repositories
        console.debug(`metrics/compute/${login}/base > keeping only ${repositories} ${type}`)
        data.user[type].nodes.splice(repositories)
        console.debug(`metrics/compute/${login}/base > loaded ${data.user[type].nodes.length} ${type}`)
      }
      //Fetch missing packages count from ghcr.io using REST API (as GraphQL API does not support it yet)
      try {
        console.debug(`metrics/compute/${login}/base > patching packages count if possible`)
        const {data: packages} = await rest.packages[{user: "listPackagesForUser", organization: "listPackagesForOrganization"}[account]]({package_type: "container", org: login, username: login})
        data.user.packages.totalCount += packages.length
        console.debug(`metrics/compute/${login}/base > patched packages count (added ${packages.length} from ghcr.io)`)
      }
      catch {
        console.debug(`metrics/compute/${login}/base > failed to patch packages count, maybe read:packages scope was not provided`)
      }
      //Shared options
      let {"repositories.skipped": skipped, "users.ignored": ignored, "commits.authoring": authoring} = imports.metadata.plugins.base.inputs({data, q, account: "bypass"})
      data.shared = {"repositories.skipped": skipped, "users.ignored": ignored, "commits.authoring": authoring, "repositories.batch": _batch}
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
      isHireable: false,
      isVerified: false,
      repositories: {},
      contributionsCollection: {},
    })
  },
  //Organization
  organization({login, data}) {
    console.debug(`metrics/compute/${login}/base > applying postprocessing`)
    data.account = "organization"
    Object.assign(data.user, {
      isHireable: false,
      repositories: {},
      starredRepositories: {totalCount: NaN},
      watching: {totalCount: NaN},
      contributionsCollection: {
        totalRepositoriesWithContributedCommits: NaN,
        totalCommitContributions: NaN,
        restrictedContributionsCount: NaN,
        totalIssueContributions: NaN,
        totalPullRequestContributions: NaN,
        totalPullRequestReviewContributions: NaN,
      },
      calendar: {contributionCalendar: {weeks: []}},
      repositoriesContributedTo: {totalCount: NaN, nodes: []},
      followers: {totalCount: NaN},
      following: {totalCount: NaN},
      issueComments: {totalCount: NaN},
      organizations: {totalCount: NaN},
    })
  },
  //Skip base content query and instantiate an empty user instance
  skip({login, data, imports}) {
    data.user = {}
    data.shared = imports.metadata.plugins.base.inputs({data, q: {}, account: "bypass"})
    for (const account of ["user", "organization"])
      postprocess?.[account]({login, data})
    data.account = "bypass"
    Object.assign(data.user, {
      databaseId: NaN,
      name: login,
      login,
      createdAt: new Date(),
      avatarUrl: `https://github.com/${login}.png`,
      websiteUrl: null,
      twitterUsername: login,
      repositories: {totalCount: NaN, totalDiskUsage: NaN, nodes: []},
      packages: {totalCount: NaN},
      repositoriesContributedTo: {totalCount: NaN, nodes: []},
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
