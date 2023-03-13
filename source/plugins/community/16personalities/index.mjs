//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q["16personalities"]) || (!imports.metadata.plugins["16personalities"].enabled(enabled, {extras})))
      return null

    //Load inputs
    let {url, sections, scores} = imports.metadata.plugins["16personalities"].inputs({data, account, q})
    if (!url)
      throw {error: {message: "URL is not set"}}

    //Start puppeteer and navigate to page
    console.debug(`metrics/compute/${login}/plugins > 16personalities > starting browser`)
    const browser = await imports.puppeteer.launch()
    console.debug(`metrics/compute/${login}/plugins > 16personalities > started ${await browser.version()}`)
    const page = await browser.newPage()
    console.debug(`metrics/compute/${login}/plugins > 16personalities > loading ${url}`)
    await page.goto(url, {waitUntil: imports.puppeteer.events})

    //Fetch raw data
    const raw = await page.evaluate(() => ({
      color:getComputedStyle(document.querySelector(".card__bg")).backgroundColor, //eslint-disable-line no-undef
      type:document.querySelector(".type__code").innerText,
      personality:[...document.querySelectorAll(".personality-cards .sp-personality-card")].map(card => ({
        category:card.querySelector(".card__title").innerText,
        value:card.querySelector(".card__subtitle").innerText,
        image:card.querySelector(".card__image").src,
        text:card.querySelector(".card__text").innerText
      })),
      traits:[...document.querySelectorAll("#traits .card__body")].map(card => ({
        category:card.querySelector(".card__title").innerText,
        value:card.querySelector(".card__subtitle").innerText,
        score:card.querySelector(".center__num").innerText,
        text:card.querySelector("p").innerText
      }))
    }))

    //Format data
    const {color} = raw
    const type = raw.type.replace("(", "").replace(")", "").trim()
    const personality = await Promise.all(raw.personality.map(async ({category, value, image, text}) => ({
      category,
      value:value.replace(`(${type})`, "").trim(),
      image:await imports.imgb64(image),
      text:text.replace(`${category}\n${value}\n`, "").trim()
    })))
    const traits = raw.traits.map(({category, value, score, text}) => ({
      category,
      value:`${value[0]}${value.substring(1).toLocaleLowerCase()}`,
      score:scores ? Number(score.replace("%", ""))/100 : NaN,
      text:text.split(".").slice(1).join("."),
    }))

    //Results
    return {sections, color, type, personality, traits}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}