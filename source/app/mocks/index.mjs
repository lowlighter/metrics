//Imports
  import axios from "axios"
  import faker from "faker"
  import paths from "path"
  import urls from "url"
  import fs from "fs/promises"

//Mocked state
  let mocked = false

//Mocking
  export default async function ({graphql, rest}) {

    //Check if already mocked
      if (mocked)
        return {graphql, rest}
      mocked = true
      console.debug(`metrics/compute/mocks > mocking`)

    //Load mocks
      const __mocks = paths.join(paths.dirname(urls.fileURLToPath(import.meta.url)))
      const mock = async ({directory, mocks}) => {
        for (const entry of await fs.readdir(directory)) {
          if ((await fs.lstat(paths.join(directory, entry))).isDirectory()) {
            if (!mocks[entry])
              mocks[entry] = {}
            await mock({directory:paths.join(directory, entry), mocks:mocks[entry]})
          }
          else
            mocks[entry.replace(/[.]mjs$/, "")] = (await import(urls.pathToFileURL(paths.join(directory, entry)).href)).default
        }
        return mocks
      }
      const mocks = await mock({directory:paths.join(__mocks, "api"), mocks:{}})

    //GraphQL API mocking
      {
        //Unmocked
          console.debug(`metrics/compute/mocks > mocking graphql api`)
          const unmocked = graphql
        //Mocked
          graphql = new Proxy(unmocked, {
            apply(target, that, args) {
              //Arguments
                const [query] = args
                const login = query.match(/login: "(?<login>.*?)"/)?.groups?.login ?? faker.internet.userName()

              //Search for mocked query
                for (const mocked of Object.keys(mocks.github.graphql))
                  if (new RegExp(`^query ${mocked.replace(/([.]\w)/g, (_, g) => g.toLocaleUpperCase().substring(1)).replace(/^(\w)/g, (_, g) => g.toLocaleUpperCase())} `).test(query))
                    return mocks.github.graphql[mocked]({faker, query, login})

              //Unmocked call
                return target(...args)
            }
          })
      }

    //Rest API mocking
      {
        //Unmocked
          console.debug(`metrics/compute/mocks > mocking rest api`)
          const unmocked = {
            request:rest.request,
            rateLimit:rest.rateLimit.get,
            listEventsForAuthenticatedUser:rest.activity.listEventsForAuthenticatedUser,
            getViews:rest.repos.getViews,
            getContributorsStats:rest.repos.getContributorsStats,
            listCommits:rest.repos.listCommits,
            listContributors:rest.repos.listContributors,
            getByUsername:rest.users.getByUsername,
          }
        //Mocked
          rest.request = new Proxy(unmocked.request, {apply:mocks.github.rest.raw.bind(null, {faker})})
          rest.rateLimit.get = new Proxy(unmocked.rateLimit, {apply:mocks.github.rest.ratelimit.bind(null, {faker})})
          rest.activity.listEventsForAuthenticatedUser = new Proxy(unmocked.listEventsForAuthenticatedUser, {apply:mocks.github.rest.events.bind(null, {faker})})
          rest.repos.getViews = new Proxy(unmocked.getViews, {apply:mocks.github.rest.views.bind(null, {faker})})
          rest.repos.getContributorsStats = new Proxy(unmocked.getContributorsStats, {apply:mocks.github.rest.stats.bind(null, {faker})})
          rest.repos.listCommits = new Proxy(unmocked.listCommits, {apply:mocks.github.rest.commits.bind(null, {faker})})
          rest.repos.listContributors = new Proxy(unmocked.listContributors, {apply:mocks.github.rest.contributors.bind(null, {faker})})
          rest.users.getByUsername = new Proxy(unmocked.getByUsername, {apply:mocks.github.rest.username.bind(null, {faker})})
      }

    //Axios mocking
      {
        //Unmocked
          console.debug(`metrics/compute/mocks > mocking axios`)
          const unmocked = {get:axios.get, post:axios.post}

        //Mocked post requests
          axios.post = new Proxy(unmocked.post, {
            apply:function(target, that, args) {
              //Arguments
                const [url, body] = args

              //Search for mocked request
                for (const service of Object.keys(mocks.axios.post)) {
                  const mocked = mocks.axios.post[service]({faker, url, body})
                  if (mocked)
                    return mocked
                }

              //Unmocked call
                return target(...args)
            }
          })

        //Mocked get requests
          axios.get = new Proxy(unmocked.get, {
            apply:function(target, that, args) {
              //Arguments
                const [url, options] = args

              //Search for mocked request
                for (const service of Object.keys(mocks.axios.get)) {
                  const mocked = mocks.axios.get[service]({faker, url, options})
                  if (mocked)
                    return mocked
                }

              //Unmocked call
                return target(...args)
            }
          })
      }

    //Return mocked elements
      return {graphql, rest}
  }

