//Setup
  export default async function ({login, rest, imports, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.activity))
            return null

        //Parameters override
          let {"activity.limit":limit = 5, "activity.days":days = 7, "activity.filter":filter = "all"} = q
          //Events
            limit = Math.max(1, Math.min(100, Number(limit)))
          //Days
            days = Number(days) > 0 ? Number(days) : Infinity
          //Filtered events
            filter = decodeURIComponent(filter).split(",").map(x => x.trim().toLocaleLowerCase()).filter(x => x)

        //Get user recent activity
          console.debug(`metrics/compute/${login}/plugins > activity > querying api`)
          const {data:events} = await rest.activity.listEventsForAuthenticatedUser({username:login, per_page:100})
          console.debug(`metrics/compute/${login}/plugins > activity > ${events.length} events loaded`)
        //Extract activity events
          const activity = events
            .filter(({actor}) => actor.login === login)
            .filter(({created_at}) => Number.isFinite(days) ? new Date(created_at) > new Date(Date.now()-days*24*60*60*1000) : true)
            .map(({type, payload, repo:{name:repo}}) => {
              //See https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/github-event-types
                switch (type) {
                  //Commented on a commit
                    case "CommitCommentEvent":{
                      if (!["created"].includes(payload.action))
                        return null
                      const {comment:{user:{login:user}, commit_id:sha, body:content}} = payload
                      return {type:"comment", on:"commit", repo, content, user, mobile:null, number:sha.substring(0, 7), title:""}
                    }
                  //Created a git branch or tag
                    case "CreateEvent":{
                      const {ref:name, ref_type:type} = payload
                      return {type:"ref/create", repo, ref:{name, type}}
                    }
                  //Deleted a git branch or tag
                    case "DeleteEvent":{
                      const {ref:name, ref_type:type} = payload
                      return {type:"ref/delete", repo, ref:{name, type}}
                    }
                  //Forked repository
                    case "ForkEvent":{
                      return {type:"fork", repo}
                    }
                  //Wiki editions
                    case "GollumEvent":{
                      const {pages} = payload
                      return {type:"wiki", repo, pages:pages.map(({title}) => title)}
                    }
                  //Commented on an issue
                    case "IssueCommentEvent":{
                      if (!["created"].includes(payload.action))
                        return null
                      const {issue:{user:{login:user}, title, number}, comment:{body:content, performed_via_github_app:mobile}} = payload
                      return {type:"comment", on:"issue", repo, content, user, mobile, number, title}
                    }
                  //Issue event
                    case "IssuesEvent":{
                      if (!["opened", "closed", "reopened"].includes(payload.action))
                        return null
                      const {action, issue:{user:{login:user}, title, number}} = payload
                      return {type:"issue", repo, action, user, number, title}
                    }
                  //Activity from repository collaborators
                    case "MemberEvent":{
                      if (!["added"].includes(payload.action))
                        return null
                      const {member:{login:user}} = payload
                      return {type:"member", repo, user}
                    }
                  //Made repository public
                    case "PublicEvent":{
                      return {type:"public", repo}
                    }
                  //Pull requests events
                    case "PullRequestEvent":{
                      if (!["opened", "closed"].includes(payload.action))
                        return null
                      const {action, pull_request:{user:{login:user}, title, number, additions:added, deletions:deleted, changed_files:changed}} = payload
                      return {type:"pr", repo, action, user, title, number, lines:{added, deleted}, files:{changed}}
                    }
                  //Reviewed a pull request
                    case "PullRequestReviewEvent":{
                      const {review:{state:review}, pull_request:{user:{login:user}, number, title}} = payload
                      return {type:"review", repo, review, user, number, title}
                    }
                  //Commented on a pull request
                    case "PullRequestReviewCommentEvent":{
                      if (!["created"].includes(payload.action))
                        return null
                      const {pull_request:{user:{login:user}, title, number}, comment:{body:content, performed_via_github_app:mobile}} = payload
                      return {type:"comment", on:"pr", repo, content, user, mobile, number, title}
                    }
                  //Pushed commits
                    case "PushEvent":{
                      const {size, commits, ref} = payload
                      return {type:"push", repo, size, branch:ref.match(/refs.heads.(?<branch>.*)/)?.groups?.branch ?? null, commits:commits.map(({sha, message}) => ({sha:sha.substring(0, 7), message}))}
                    }
                  //Released
                    case "ReleaseEvent":{
                      if (!["published"].includes(payload.action))
                        return null
                      const {action, release:{name, prerelease, draft}} = payload
                      return {type:"release", repo, action, name, prerelease, draft}
                    }
                  //Starred a repository
                    case "WatchEvent":{
                      if (!["started"].includes(payload.action))
                        return null
                      const {action} = payload
                      return {type:"star", repo, action}
                    }
                  //Unknown event
                    default:{
                      return null
                    }
                }
            })
            .filter(event => event)
            .filter(event => filter.includes("all") || filter.includes(event.type))
            .slice(0, limit)

        //Results
          return {events:activity}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }

