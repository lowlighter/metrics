/** Template processor */
  export default async function ({login, q}, {conf, data, rest, graphql, plugins, queries}, {s, pending, imports}) {
    //Core
      await imports.plugins.core(...arguments)
    //Disable optimization to keep white-spaces
      q.raw = true
  }