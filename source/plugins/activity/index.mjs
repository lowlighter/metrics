//Setup
  export default async function ({login, rest, imports, q}, {enabled = false, from:defaults = 100} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.activity))
            return null
        //Parameters override
          let {"activity.from":from = defaults.from ?? 5, "activity.days":days = 7} = q
          //Events
            from = Math.max(1, Math.min(100, Number(from)))
          //Days
            days = Number(days) > 0 ? Number(days) : Infinity
        //Get user recent activity
          console.debug(`metrics/compute/${login}/plugins > activity > querying api`)
          const {data:events} = await rest.activity.listEventsForAuthenticatedUser({username:login, per_page:100})
          console.debug(`metrics/compute/${login}/plugins > activity > ${events.length} events loaded`)
        //TODO : Remove after debugging
        //Search for events not implemented
          try {
            for (let page = 0; page < 5; page++) {
              const {data:events} = await rest.activity.listEventsForAuthenticatedUser({username:login, per_page:100, page})
              console.log(imports.util.inspect(events.filter(({type}) => ["CommitCommentEvent", "MemberEvent", "PublicEvent", "SponsorshipEvent"].includes(type)), {depth:1/0}))
            }
          } catch { }
        //Extract activity events
          const activity = events
            .filter(({actor}) => actor.login === login)
            .filter(({created_at}) => Number.isFinite(days) ? new Date(created_at) > new Date(Date.now()-days*24*60*60*1000) : true)
            .map(({type, payload, repo:{name:repo}}) => {
              switch (type) {
                //Commented on a commit
                  //case "CommitCommentEvent":{
                    //return {type, repo}
                  //}
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
                    const {issue:{user:{login:user}, title, number}, comment:{body:content, performed_via_github_app:mobile}} = payload
                    return {type:"comment", on:"issue", repo, content, user, mobile, number, title}
                  }
                //Issue event
                  case "IssuesEvent":{
                    const {action, issue:{user:{login:user}, title, number}} = payload
                    if (["opened", "closed", "reopened"].includes(action))
                      return {type:"issue", repo, action, user, number, title}
                    return null
                  }
                //Activity from repository collaborators
                  //case "MemberEvent":{
                    //return {type, repo}
                  //}
                //Made repository public
                  case "PublicEvent":{
                    return {type:"public", repo}
                  }
                //Pull requests events
                  case "PullRequestEvent":{
                    const {action, pull_request:{title, number, additions:added, deletions:deleted, changed_files:changed}} = payload
                    if (["opened", "closed"].includes(action))
                      return {type:"pr", repo, action, title, number, lines:{added, deleted}, files:{changed}}
                    return null
                  }
                //Reviewed a pull request
                  case "PullRequestReviewEvent":{
                    const {review:{state:review}, pull_request:{user:{login:user}, number, title}} = payload
                    return {type:"review", repo, review, user, number, title}
                  }
                //Commented on a pull request
                  case "PullRequestReviewCommentEvent":{
                    const {pull_request:{user:{login:user}, title, number}, comment:{body:content, performed_via_github_app:mobile}} = payload
                    return {type:"comment", on:"pr", repo, content, user, mobile, number, title}
                  }
                //Pushed commits
                  case "PushEvent":{
                    const {size, commits} = payload
                    return {type:"push", repo, size, commits:commits.map(({sha, message}) => ({sha:sha.substring(0, 7), message}))}
                  }
                //Released
                  case "ReleaseEvent":{
                    const {action, release:{name, prerelease, draft}} = payload
                    return {type:"release", repo, action, name, prerelease, draft}
                  }
                //Sponsorships
                  //case "SponsorshipEvent":{
                    //return {type, repo}
                  //}
                //Starred a repository
                  case "WatchEvent":{
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
            .slice(0, from)

        //Results
          return {events:activity}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }