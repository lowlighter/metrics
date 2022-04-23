//Setup
export default async function({login, data, rest, q, account, imports}, {enabled = false, markdown = "inline"} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.activity))
      return null

    //Context
    let context = {mode: "user"}
    if (q.repo) {
      console.debug(`metrics/compute/${login}/plugins > activity > switched to repository mode`)
      const {owner, repo} = data.user.repositories.nodes.map(({name: repo, owner: {login: owner}}) => ({repo, owner})).shift()
      context = {...context, mode: "repository", owner, repo}
    }

    //Load inputs
    let {limit, load, days, filter, visibility, timestamps, skipped, ignored} = imports.metadata.plugins.activity.inputs({data, q, account})
    if (!days)
      days = Infinity
    skipped.push(...data.shared["repositories.skipped"])
    ignored.push(...data.shared["users.ignored"])
    const pages = Math.ceil(load / 100)
    const codelines = 2

    //Get user recent activity
    console.debug(`metrics/compute/${login}/plugins > activity > querying api`)
    const events = []
    try {
      for (let page = 1; page <= pages; page++) {
        console.debug(`metrics/compute/${login}/plugins > activity > loading page ${page}/${pages}`)
        events.push(...(context.mode === "repository" ? await rest.activity.listRepoEvents({owner: context.owner, repo: context.repo}) : await rest.activity.listEventsForAuthenticatedUser({username: login, per_page: 100, page})).data)
      }
    }
    catch {
      console.debug(`metrics/compute/${login}/plugins > activity > no more page to load`)
    }
    console.debug(`metrics/compute/${login}/plugins > activity > ${events.length} events loaded`)

    //Extract activity events
    const activity = (await Promise.all(
      events
        .filter(({actor}) => account === "organization" ? true : actor.login?.toLocaleLowerCase() === login.toLocaleLowerCase())
        .filter(({created_at}) => Number.isFinite(days) ? new Date(created_at) > new Date(Date.now() - days * 24 * 60 * 60 * 1000) : true)
        .filter(event => visibility === "public" ? event.public : true)
        .map(async ({type, payload, actor: {login: actor}, repo: {name: repo}, created_at}) => {
          //See https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/github-event-types
          const timestamp = new Date(created_at)
          if ((skipped.includes(repo.split("/").pop())) || (skipped.includes(repo)))
            return null
          switch (type) {
            //Commented on a commit
            case "CommitCommentEvent": {
              if (!["created"].includes(payload.action))
                return null
              const {comment: {user: {login: user}, commit_id: sha, body: content}} = payload
              if (ignored.includes(user))
                return null
              return {type: "comment", on: "commit", actor, timestamp, repo, content: await imports.markdown(content, {mode: markdown, codelines}), user, mobile: null, number: sha.substring(0, 7), title: ""}
            }
            //Created a git branch or tag
            case "CreateEvent": {
              const {ref: name, ref_type: type} = payload
              return {type: "ref/create", actor, timestamp, repo, ref: {name, type}}
            }
            //Deleted a git branch or tag
            case "DeleteEvent": {
              const {ref: name, ref_type: type} = payload
              return {type: "ref/delete", actor, timestamp, repo, ref: {name, type}}
            }
            //Forked repository
            case "ForkEvent": {
              const {forkee: {full_name: forked}} = payload
              return {type: "fork", actor, timestamp, repo, forked}
            }
            //Wiki editions
            case "GollumEvent": {
              const {pages} = payload
              return {type: "wiki", actor, timestamp, repo, pages: pages.map(({title}) => title)}
            }
            //Commented on an issue
            case "IssueCommentEvent": {
              if (!["created"].includes(payload.action))
                return null
              const {issue: {user: {login: user}, title, number}, comment: {body: content, performed_via_github_app: mobile}} = payload
              if (ignored.includes(user))
                return null
              return {type: "comment", on: "issue", actor, timestamp, repo, content: await imports.markdown(content, {mode: markdown, codelines}), user, mobile, number, title}
            }
            //Issue event
            case "IssuesEvent": {
              if (!["opened", "closed", "reopened"].includes(payload.action))
                return null
              const {action, issue: {user: {login: user}, title, number, body: content}} = payload
              if (ignored.includes(user))
                return null
              return {type: "issue", actor, timestamp, repo, action, user, number, title, content: await imports.markdown(content, {mode: markdown, codelines})}
            }
            //Activity from repository collaborators
            case "MemberEvent": {
              if (!["added"].includes(payload.action))
                return null
              const {member: {login: user}} = payload
              if (ignored.includes(user))
                return null
              return {type: "member", actor, timestamp, repo, user}
            }
            //Made repository public
            case "PublicEvent": {
              return {type: "public", actor, timestamp, repo}
            }
            //Pull requests events
            case "PullRequestEvent": {
              if (!["opened", "closed"].includes(payload.action))
                return null
              const {action, pull_request: {user: {login: user}, title, number, body: content, additions: added, deletions: deleted, changed_files: changed, merged}} = payload
              if (ignored.includes(user))
                return null
              return {type: "pr", actor, timestamp, repo, action: (action === "closed") && (merged) ? "merged" : action, user, title, number, content: await imports.markdown(content, {mode: markdown, codelines}), lines: {added, deleted}, files: {changed}}
            }
            //Reviewed a pull request
            case "PullRequestReviewEvent": {
              const {review: {state: review}, pull_request: {user: {login: user}, number, title}} = payload
              if (ignored.includes(user))
                return null
              return {type: "review", actor, timestamp, repo, review, user, number, title}
            }
            //Commented on a pull request
            case "PullRequestReviewCommentEvent": {
              if (!["created"].includes(payload.action))
                return null
              const {pull_request: {user: {login: user}, title, number}, comment: {body: content, performed_via_github_app: mobile}} = payload
              if (ignored.includes(user))
                return null
              return {type: "comment", on: "pr", actor, timestamp, repo, content: await imports.markdown(content, {mode: markdown, codelines}), user, mobile, number, title}
            }
            //Pushed commits
            case "PushEvent": {
              let {size, commits, ref} = payload
              commits = commits.filter(({author: {email}}) => !ignored.includes(email))
              if (!commits.length)
                return null
              if (commits.slice(-1).pop()?.message.startsWith("Merge branch "))
                commits = commits.slice(-1)
              return {type: "push", actor, timestamp, repo, size, branch: ref.match(/refs.heads.(?<branch>.*)/)?.groups?.branch ?? null, commits: commits.reverse().map(({sha, message}) => ({sha: sha.substring(0, 7), message}))}
            }
            //Released
            case "ReleaseEvent": {
              if (!["published"].includes(payload.action))
                return null
              const {action, release: {name, tag_name, prerelease, draft, body: content}} = payload
              return {type: "release", actor, timestamp, repo, action, name: name || tag_name, prerelease, draft, content: await imports.markdown(content, {mode: markdown, codelines})}
            }
            //Starred a repository
            case "WatchEvent": {
              if (!["started"].includes(payload.action))
                return null
              const {action} = payload
              return {type: "star", actor, timestamp, repo, action}
            }
            //Unknown event
            default: {
              return null
            }
          }
        }),
    ))
      .filter(event => event)
      .filter(event => filter.includes("all") || filter.includes(event.type))
      .slice(0, limit)

    //Results
    return {timestamps, events: activity}
  }
  //Handle errors
  catch (error) {
    throw {error: {message: "An error occured", instance: error}}
  }
}
