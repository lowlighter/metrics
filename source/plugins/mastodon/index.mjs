//Setup
export default async function({login, data, imports, q, queries, account}, {enabled = false} = {}) {
    //Plugin execution
    try {
        //Check if plugin is enabled and requirements are met
        if ((!enabled) || (!q.mastodon))
            return null
        
        //Load inputs
        let {source, sensitive, replies, limit, user} = imports.metadata.plugins.mastodon.inputs({data, account, q})
        
        //Retrieve posts
        console.debug(`metrics/compute/${login}/plugins > mastodon > processing with source ${source}`)
        let posts = null
        let link = null
        
        posts = (await imports.axios.get(`https://${source}/api/v1/accounts/${user}/statuses`)).data.map((
            {content:description, created_at:date, sensitive, spoiler_text:spoiler, url:link, in_reply_to_id:reply}
        ) => ({description, date, sensitive, spoiler, link, reply}))
        link = `${source}/@${user}`
        
        //Format posts
        if (Array.isArray(posts)) {
            //Limit posts
            if (limit > 0) {
                console.debug(`metrics/compute/${login}/plugins > mastodon > keeping only ${limit} posts`)
                posts.splice(limit)
            }
            
            //Results
            return {source, link, sensitive, replies, list:posts}
        }
        
        //Unhandled error
        throw {error:{message:"An error occured (could not retrieve posts)"}}
    }
    //Handle errors
    catch (error) {
        if (error.error?.message)
            throw error
        throw {error:{message:"An error occured", instance:error}}
    }
}