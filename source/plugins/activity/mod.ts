// deno-lint-ignore-file no-explicit-any no-unused-vars no-unreachable
//TODO(@lowlighter): finish implementation, use the correct language color from cache
// Imports
import { is, parse, Plugin } from "@engine/components/plugin.ts"
import { ignored, matchPatterns, reactions } from "@engine/utils/github.ts"
import { markdown } from "@engine/utils/markdown.ts"

const user = is.object({
  login: is.string().describe("User login"),
  avatar: is.string().describe("User avatar url"),
  type: is.string().describe("User type"),
})

const repository = is.object({
  name: is.string().describe("Repository name"),
  owner: user.describe("Repository owner"),
  description: is.string().describe("Repository description"),
  fork: is.boolean().describe("Repository is a fork"),
  template: is.boolean().describe("Repository is a template"),
  archived: is.boolean().describe("Repository is archived"),
  created: is.date().describe("Repository creation date"),
  stargazers: is.number().int().min(0).describe("Repository number of stargazers"),
  watchers: is.number().int().min(0).describe("Repository number of watchers"),
  forks: is.number().int().min(0).describe("Repository number of forks"),
  issues: is.number().int().min(0).describe("Repository number of open issues"),
  language: is.object({
    name: is.string().describe("Repository language name"),
    color: is.string().describe("Repository language color"),
  }).describe("Repository language"),
  license: is.string().nullable().describe("Repository license"),
  topics: is.array(is.string()).describe("Repository topics"),
})

const issue = is.object({
  author: user.describe("Issue author"),
  number: is.number().int().min(0).describe("Issue number"),
  title: is.string().describe("Issue title"),
  content: is.string().nullable().describe("Issue content"),
  labels: is.array(is.object({ name: is.string(), color: is.string() })).describe("Issue labels"),
  assignees: is.array(user).describe("Issue assignees"),
  milestone: is.string().nullable().describe("Issue milestone"),
  comments: is.number().int().min(0).describe("Issue number of comments"),
  reactions: is.record(is.number().int().min(0)).describe("Issue reactions"),
})

const event = {
  common: is.object({
    timestamp: is.number().int().min(0).describe("Event timestamp"),
    actor: user.describe("Event actor"),
    repository: repository.pick({ name: true }).describe("Event repository"),
  }),
  user,
  repository,
  issue,
}

/** Plugin */
export default class extends Plugin {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "📰 Recent activity"

  /** Category */
  readonly category = "github"

  /** Description */
  readonly description = "Display recent activity on GitHub"

  /** Supports */
  readonly supports = ["user", "organization", "repository"]

  /** Inputs */
  readonly inputs = is.object({
    visibility: is.union([
      is.literal("public").describe("Includes public events only"),
      is.literal("all").describe("Includes public and private events (n.b. still subject to token permissions)"),
    ]).default("public").describe("Activity events visibility"),
    users: is.object({
      matching: is.preprocess((value) => [value].flat(), is.array(is.string())).default(() => ["*", ...ignored.users]).describe("Include users matching at least one of these patterns"),
    }).default(() => ({})).describe("Users options"),
    repositories: is.object({
      matching: is.preprocess((value) => [value].flat(), is.array(is.string())).default(() => ["*/*", ...ignored.repositories]).describe(
        "Include repositories matching at least one of these patterns",
      ),
    }).default(() => ({})).describe("Repositories options"),

    limit: is.number().int().min(1).nullable().default(5).describe("Display limit. Set to `null` to disable"),
  })

  /** Outputs */
  readonly outputs = is.object({
    events: is.array(is.union([
      event.common.extend({
        type: is.literal("issue").describe("Event type"),
        action: is.string().describe("Event action"),
        issue: event.issue.describe("Event issue"),
      }),
      /*
      event.common.merge(event.user).extend({
        type: is.literal("pullrequest").describe("Event type"),
        number: is.number().int().min(0).describe("Pull request number"),
        title: is.string().describe("Pull request title"),
        content: is.string().describe("Pull request content"),
        labels: is.array(is.object({name: is.string(), color: is.string()})).describe("Pull request labels"),
        assignees: is.array(event.user).describe("Pull request assignees"),
        milestone: is.string().nullable().describe("Pull request milestone"),
        comments: is.number().int().min(0).describe("Pull request number of content comments"),
        reactions: is.record(is.number().int().min(0)).describe("Pull request reactions"),
        draft: is.boolean().describe("Pull request is a draft"),
        head: is.object({
          branch: is.string().describe("Pull request head branch"),
          repository: is.string().describe("Pull request head repository"),
        }).describe("Pull request head"),
        base: is.object({
          branch: is.string().describe("Pull request base branch"),
          repository: is.string().describe("Pull request base repository"),
        }).describe("Pull request base"),
        changes: is.object({
          additions: is.number().int().min(0).describe("Pull request number of additions"),
          deletions: is.number().int().min(0).describe("Pull request number of deletions"),
          files: is.number().int().min(0).describe("Pull request number of changed files"),
        }).describe("Pull request changes"),
      }),
      event.common.merge(event.user).extend({
        type: is.literal("release").describe("Event type"),
        tag: is.string().describe("Release tag"),
        title: is.string().describe("Release title"),
        content: is.string().describe("Release patchnote"),
        draft: is.boolean().describe("Release is a draft"),
        prerelease: is.boolean().describe("Release is a prerelease"),
        mentions: is.array(event.user)
      }),*/
      event.common.extend({
        type: is.literal("star").describe("Event type"),
        repository: event.repository.describe("Event repository"),
      }),
    ])).describe("Activity events"),
  })

  /** EJS template additional rendering context */
  protected _renderctx = { markdown }

  /** Action */
  protected async action() {
    const { handle } = this.context
    const { users } = await parse(this.inputs, this.context.args)

    let events = await this.rest(this.api.activity.listPublicEventsForUser, { username: handle! }, { paginate: true })

    events = [
      ...await Promise.all(
        events.map(
          async (
            { type, created_at, payload, actor, repo }: { type: string; created_at: string; payload: Record<PropertyKey, any>; actor: { login: string; avatar_url: string }; repo: { name: string } },
          ) => {
            const event = { timestamp: new Date(created_at).getTime(), actor: { login: actor.login, avatar: actor.avatar_url, type: "user" }, repository: { name: repo.name } }
            switch (type) {
              case "CommitCommentEvent": {
                return null
              }
              case "CreateEvent": {
                return null
              }
              case "DeleteEvent": {
                return null
              }
              case "ForkEvent": {
                return null
              }
              case "GollumEvent": {
                return null
              }
              case "IssueCommentEvent": {
                return null
              }
              // Issue created
              case "IssuesEvent": {
                if (!["opened", "edited", "closed", "reopened", "assigned", "unassigned"].includes(payload.action)) {
                  return null
                }
                if (!matchPatterns(users.matching, payload.issue.user.login)) {
                  return null
                }
                return Object.assign(event, { type: "issue", action: payload.action, issue: this.issue(payload.issue) })
              }
              case "MemberEvent": {
                return null
              }
              case "PublicEvent": {
                return null
              }
              // Pull request created
              case "PullRequestEvent": {
                return null
                if (!["opened", "edited", "closed", "reopened", "assigned", "unassigned"].includes(payload.action)) {
                  return null
                }
                if (!matchPatterns(users.matching, payload.pull_request.user.login)) {
                  return null
                }
                return Object.assign(event, { type: "pullrequest", action: payload.action, ...this.pullrequest(payload.pull_request) })
              }
              case "PullRequestReviewEvent": {
                return null
              }
              case "PullRequestReviewCommentEvent": {
                //console.log(payload)
                return null
              }
              case "PullRequestReviewThreadEvent": {
                return null
              }
              case "PushEvent": {
                return null //Object.assign(event, {type:"push", ...this.push(payload)})
              }
              // Release published
              case "ReleaseEvent": {
                return null
                if (payload.action !== "published") {
                  return null
                }
                return Object.assign(event, { type: "release", ...this.release(payload.release) })
              }
              //
              case "SponsorshipEvent": { //created
                return null
              }
              //Repository starred
              case "WatchEvent": {
                if (payload.action !== "started") {
                  return null
                }
                const { data } = await this.rest(this.api.repos.get, { owner: repo.name.split("/")[0], repo: repo.name.split("/")[1] })
                return Object.assign(event, { type: "star", repository: this.repository(data) })
              }
              default: {
                //console.log(type, payload)
              }
            }
          },
        ),
      ),
    ].filter((event) => event)

    console.log(events)
    return { events }
  }

  private repository(repository: any) {
    return {
      name: repository.full_name,
      owner: {
        login: repository.owner.login,
        avatar: repository.owner.avatar_url,
        type: repository.owner.type.toLocaleLowerCase(),
      },
      description: repository.description,
      fork: repository.fork,
      template: repository.is_template,
      archived: repository.archived,
      created: new Date(repository.created_at),
      stargazers: repository.stargazers_count,
      watchers: repository.watchers_count,
      forks: repository.forks_count,
      language: {
        name: repository.language,
        color: "#959da5",
      },
      issues: repository.open_issues_count,
      license: repository.license?.name ?? null,
      topics: repository.topics,
    }
  }

  private comment(comment: any) {
    return {}
  }

  private push(push: any) {
    return {
      branch: push.ref.replace(/^refs\/heads\//, ""),
      commits: push.commits.map(({ sha, message }: Record<PropertyKey, string>) => ({ sha, message })).reverse(),
    }
  }

  /** Format release content */
  private release(release: any) {
    return {
      user: {
        login: release.author.login,
        avatar: release.author.avatar_url,
      },
      tag: release.tag_name,
      title: release.name,
      content: release.body,
      draft: release.draft,
      prerelease: release.prerelease,
      mentions: release.mentions?.map(({ login, avatar_url }: Record<PropertyKey, string>) => ({ login, avatar: avatar_url })) ?? [],
    }
  }

  /** Format issue content */
  private issue(issue: any) {
    return {
      author: {
        login: issue.user.login,
        avatar: issue.user.avatar_url,
        type: issue.user.type.toLocaleLowerCase(),
      },
      number: issue.number,
      title: issue.title,
      content: issue.body,
      labels: issue.labels.map(({ name, color }: Record<PropertyKey, string>) => ({ name, color })),
      assignees: issue.assignees.map(({ login, avatar_url, type }: Record<PropertyKey, string>) => ({ login, avatar: avatar_url, type: issue.user.type.toLocaleLowerCase() })),
      milestone: issue.milestone?.title ?? null,
      comments: issue.comments,
      reactions: Object.fromEntries(Object.entries(issue.reactions ?? {}).filter(([key]) => key in reactions.rest).map(([key, value]) => [reactions.rest[key as keyof typeof reactions.rest], value])),
    }
  }

  private pullrequest(pullrequest: any) {
    //merged
    return {
      ...this.issue(pullrequest),
      draft: pullrequest.draft,
      //review_comments
      head: {
        branch: pullrequest.head.label,
        repository: pullrequest.head.repo.full_name,
      },
      base: {
        branch: pullrequest.base.label,
        repository: pullrequest.base.repo.full_name,
      },
      changes: {
        additions: pullrequest.additions,
        deletions: pullrequest.deletions,
        files: pullrequest.changed_files,
      },
      //merged_by user ?
    }
  }
}
