//Imports
import { faker } from "@faker-js/faker"
import { Client as Gmap } from "@googlemaps/google-maps-services-js"
import axios from "axios"
import fs from "fs/promises"
import paths from "path"
import rss from "rss-parser"
import urls from "url"

//Mocked state
let mocked = false

//Mocking
export default async function({graphql, rest}) {
  //Check if already mocked
  if (mocked)
    return {graphql, rest}
  mocked = true
  process.env.METRICS_MOCKED = true
  console.debug("metrics/compute/mocks > mocking")

  //Load mocks
  const __mocks = paths.join(paths.dirname(urls.fileURLToPath(import.meta.url)))
  const mock = async ({directory, mocks}) => {
    for (const entry of await fs.readdir(directory)) {
      if ((await fs.lstat(paths.join(directory, entry))).isDirectory()) {
        if (!mocks[entry])
          mocks[entry] = {}
        await mock({directory: paths.join(directory, entry), mocks: mocks[entry]})
      }
      else {
        mocks[entry.replace(/[.]mjs$/, "")] = (await import(urls.pathToFileURL(paths.join(directory, entry)).href)).default
      }
    }
    return mocks
  }
  const mocks = await mock({directory: paths.join(__mocks, "api"), mocks: {}})

  //GraphQL API mocking
  {
    //Unmocked
    console.debug("metrics/compute/mocks > mocking graphql api")
    const unmocked = graphql
    //Mocked
    graphql = new Proxy(unmocked, {
      apply(target, that, args) {
        //Arguments
        const [query] = args
        const login = query.match(/login: "(?<login>.*?)"/)?.groups?.login ?? faker.internet.userName()

        //Search for mocked query
        for (const mocked of Object.keys(mocks.github.graphql)) {
          if (new RegExp(`^query ${mocked.replace(/([.]\w)/g, (_, g) => g.toLocaleUpperCase().substring(1)).replace(/^(\w)/g, (_, g) => g.toLocaleUpperCase())} `).test(query))
            return mocks.github.graphql[mocked]({faker, query, login})
        }

        //Unmocked call
        return target(...args)
      },
    })
  }

  //Rest API mocking
  {
    //Unmocked
    console.debug("metrics/compute/mocks > mocking rest api")
    const unmocked = {}
    //Mocked
    const mocker = ({path = "rest", mocks, mocked}) => {
      for (const [key, value] of Object.entries(mocks)) {
        console.debug(`metrics/compute/mocks > mocking rest api > mocking ${path}.${key}`)
        if (typeof value === "function") {
          unmocked[path] = value
          mocked[key] = new Proxy(unmocked[path], {apply: value.bind(null, {faker})})
        }
        else {
          mocker({path: `${path}.${key}`, mocks: mocks[key], mocked: mocked[key]})
        }
      }
    }
    mocker({mocks: mocks.github.rest, mocked: rest})
  }

  //Axios mocking
  {
    //Unmocked
    console.debug("metrics/compute/mocks > mocking axios")
    const unmocked = {get: axios.get, post: axios.post}

    //Mocked post requests
    axios.post = new Proxy(unmocked.post, {
      apply(target, that, args) {
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
      },
    })

    //Mocked get requests
    axios.get = new Proxy(unmocked.get, {
      apply(target, that, args) {
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
      },
    })
  }

  //RSS mocking
  {
    //Unmocked
    console.debug("metrics/compute/mocks > mocking rss-parser")

    //Mock rss feed
    rss.prototype.parseURL = function(url) {
      console.debug(`metrics/compute/mocks > mocking rss feed result > ${url}`)
      return ({
        items: new Array(30).fill(null).map(_ => ({
          title: faker.lorem.sentence(),
          link: faker.internet.url(),
          content: faker.lorem.paragraphs(),
          contentSnippet: faker.lorem.paragraph(),
          isoDate: faker.date.recent(),
        })),
        title: faker.lorem.words(),
        description: faker.lorem.paragraph(),
        link: url,
      })
    }
  }

  //Google API mocking
  {
    //Unmocked
    console.debug("metrics/compute/mocks > mocking google-maps-services-js")

    //Mock geocode API
    Gmap.prototype.geocode = function() {
      console.debug("metrics/compute/mocks > mocking google maps geocode result")
      const lat = faker.address.latitude()
      const lng = faker.address.longitude()
      const city = faker.address.city()
      const country = faker.address.country()
      return {
        data: {
          results: [
            {
              address_components: [
                {
                  long_name: city,
                  short_name: city,
                  types: ["political"],
                },
                {
                  long_name: country,
                  short_name: faker.address.countryCode(),
                  types: ["country", "political"],
                },
              ],
              formatted_address: `${city}, ${country}`,
              geometry: {
                bounds: {
                  northeast: {lat, lng},
                  southwest: {lat, lng},
                },
                location: {lat, lng},
                location_type: "APPROXIMATE",
                viewport: {
                  northeast: {lat, lng},
                  southwest: {lat, lng},
                },
              },
              place_id: "ChIJu9FC7RXupzsR26dsAapFLgg",
              types: ["locality", "political"],
            },
          ],
        },
      }
    }
  }

  //Return mocked elements
  return {graphql, rest}
}
