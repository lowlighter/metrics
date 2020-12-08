//Setup
  export default async function ({login, imports, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.topics))
            return null
        //Parameters override
          let {"topics.sort":sort = "stars", "topics.limit":limit = 15} = q
          //Shuffle
            const shuffle = (sort === "random")
          //Sort method
            sort = {starred:"created", activity:"updated", stars:"stars", random:"created"}[sort] ?? "starred"
          //Limit
            limit = Math.max(1, Math.min(20, Number(limit)))
        //Start puppeteer and navigate to topics
          let topics = []
          console.debug(`metrics/compute/${login}/plugins > topics > starting browser`)
          const browser = await imports.puppeteer.launch({headless:true, executablePath:process.env.PUPPETEER_BROWSER_PATH, args:["--no-sandbox", "--disable-extensions", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]})
          console.debug(`metrics/compute/${login}/plugins > topics > loaded ${await browser.version()}`)
          const page = await browser.newPage()
        //Iterate through pages
          for (let i = 1; i <= 100; i++) {
            //Load page
              console.debug(`metrics/compute/${login}/plugins > topics > loading page ${i}`)
              await page.goto(`https://github.com/stars/${login}/topics?direction=desc&page=${i}&sort=${sort}`)
              const frame = page.mainFrame()
            //Extract topics
              await Promise.race([frame.waitForSelector("ul.repo-list"), frame.waitForSelector(".blankslate")])
              const starred = await frame.evaluate(() => [...document.querySelectorAll("ul.repo-list li")].map(li => ({
                name:li.querySelector(".f3").innerText,
                description:li.querySelector(".f5").innerText,
                icon:li.querySelector("img")?.src ?? null,
              })))
            //Check if next page exists
              if (!starred.length)
                break
              topics.push(...starred)
          }
        //Shuffle topics
          if (shuffle)
            topics = imports.shuffle(topics)
        //Limit topics
          if (limit > 0) {
            console.debug(`metrics/compute/${login}/plugins > topics > keeping only ${limit} topics`)
            const removed = topics.slice(limit)
            topics = topics.slice(0, limit)
            topics.push({name:`And ${removed.length} more...`, description:removed.map(({name}) => name).join(", "), icon:null})
          }
        //Convert icons to base64
          for (const topic of topics) {
            if (topic.icon) {
              console.debug(`metrics/compute/${login}/plugins > topics > processing ${topic.name}`)
              topic.icon = await imports.imgb64(topic.icon)
            }
            //Escape HTML description
              topic.description = imports.htmlescape(topic.description)
          }
        //Results
          return {list:topics}
      }
    //Handle errors
      catch (error) {
        console.debug(error)
        throw {error:{message:`An error occured`}}
      }
  }