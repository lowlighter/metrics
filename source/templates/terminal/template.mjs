//Imports
  import common from "./../common.mjs"

/** Template processor */
  export default async function ({login, q}, {conf, data, rest, graphql, plugins, queries}, {s, pending, imports}) {
    //Common
      await common(...arguments)
    //Disable optimization to keep white-spaces
      q.raw = true
  }