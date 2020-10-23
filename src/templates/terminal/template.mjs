//Imports
  import common from "./../common.mjs"

/** Template processor */
  export default async function ({login, q}, {conf, data, rest, graphql, plugins}, {s, pending, imports}) {
    //Common
      await common(...arguments)
      const computed = data.computed
      await Promise.all(pending)

    //Compute image size
      computed.svg = {height:640, width:480}
      if (computed.plugins.followup)
        computed.svg.height += 100
      if (computed.plugins.lines)
        computed.svg.height += 30
      if (computed.plugins.traffic)
        computed.svg.height += 16
      if (computed.plugins.pagespeed)
        computed.svg.height += 136
      if (computed.plugins.languages)
        computed.svg.height += 170

    //Compute registration date
      const diff = (Date.now()-(new Date(data.user.createdAt)).getTime())/(365*24*60*60*1000)
      const years = Math.floor(diff)
      const months = Math.ceil((diff-years)*12)
      computed.registration = years ? `${years}y` : `${months}m`

    //Meta
      data.meta = {
        version:conf.package.version,
        $:`<span class="ps1-path">${data.user.login}@metrics</span>:<span class="ps1-location">~</span>${computed.token.scopes.includes("repo") ? "#" : "$"}`,
      }
  }