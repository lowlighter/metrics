//Setup
export default async function({login, imports, data, q, account}, {enabled = false, token = "", extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.tweets) || (!imports.metadata.plugins.tweets.extras("enabled", {extras})))
      return null

    //Load inputs
    let {limit, user: username, attachments} = imports.metadata.plugins.tweets.inputs({data, account, q})

    //Load user profile
    console.debug(`metrics/compute/${login}/plugins > tweets > loading twitter profile (@${username})`)
    const {data: {data: profile = null}} = await imports.axios.get(`https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url,verified`, {headers: {Authorization: `Bearer ${token}`}})

    //Load profile image
    if (profile?.profile_image_url) {
      console.debug(`metrics/compute/${login}/plugins > tweets > loading profile image`)
      profile.profile_image = await imports.imgb64(profile.profile_image_url)
    }

    //Load tweets
    console.debug(`metrics/compute/${login}/plugins > tweets > querying api`)
    const {data: {data: tweets = [], includes: {media = []} = {}}} = await imports.axios.get(
      `https://api.twitter.com/2/tweets/search/recent?query=from:${username}&tweet.fields=created_at,entities&media.fields=preview_image_url,url,type&expansions=entities.mentions.username,attachments.media_keys`,
      {headers: {Authorization: `Bearer ${token}`}},
    )
    const medias = new Map(media.map(({media_key, type, url, preview_image_url}) => [media_key, (type === "photo") || (type === "animated_gif") ? url : type === "video" ? preview_image_url : null]))

    //Limit tweets
    if (limit > 0) {
      console.debug(`metrics/compute/${login}/plugins > tweets > keeping only ${limit} tweets`)
      tweets.splice(limit)
    }

    //Format tweets
    await Promise.all(tweets.map(async tweet => {
      //Mentions and urls
      tweet.mentions = tweet.entities?.mentions?.map(({username}) => username) ?? []
      tweet.urls = new Map(tweet.entities?.urls?.map(({url, display_url: link}) => [url, link]) ?? [])
      //Attachments
      if (attachments) {
        //Retrieve linked content
        let linked = null
        if (tweet.urls.size) {
          linked = [...tweet.urls.keys()][tweet.urls.size - 1]
          tweet.text = tweet.text.replace(new RegExp(`(?:${linked})$`), "")
        }
        //Medias
        if (tweet.attachments)
          tweet.attachments = await Promise.all(tweet.attachments.media_keys.filter(key => medias.get(key)).map(key => medias.get(key)).map(async url => ({image: await imports.imgb64(url, {height: -1, width: 450})})))
        if (linked) {
          const {result: {ogImage, ogSiteName: website, ogTitle: title, ogDescription: description}} = await imports.opengraph({url: linked})
          const image = await imports.imgb64(ogImage?.url, {height: -1, width: 450, fallback: false})
          if (image) {
            if (tweet.attachments)
              tweet.attachments.unshift([{image, title, description, website}])
            else
              tweet.attachments = [{image, title, description, website}]
          }
          else {
            tweet.text = `${tweet.text}\n${linked}`
          }
        }
      }
      else {
        tweet.attachments = null
      }

      //Format text
      console.debug(`metrics/compute/${login}/plugins > tweets > formatting tweet ${tweet.id}`)
      tweet.createdAt = `${imports.format.date(tweet.created_at, {time: true})} on ${imports.format.date(tweet.created_at, {date: true})}`
      tweet.text = imports.htmlescape(
        //Escape tags
        imports.htmlescape(tweet.text, {"<": true, ">": true})
          //Mentions
          .replace(new RegExp(`@(${tweet.mentions.join("|")})`, "gi"), '<span class="mention">@$1</span>')
          //Hashtags (this regex comes from the twitter source code)
          .replace(
            /(?<!&)[#|＃]([a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*[a-z_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f][a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*)/gi,
            ' <span class="hashtag">#$1</span> ',
          )
          //Line breaks
          .replace(/\n/g, "<br/>")
          //Links
          .replace(new RegExp(`${tweet.urls.size ? "" : "noop^"}(${[...tweet.urls.keys()].map(url => `(?:${url})`).join("|")})`, "gi"), (_, url) => `<a href="${url}" class="link">${tweet.urls.get(url)}</a>`),
        {"&": true},
      )
    }))

    //Result
    return {username, profile, list: tweets}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
