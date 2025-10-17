//Imports
import linguist from "linguist-js"
import { filters } from "../../../app/metrics/utils.mjs"
import { Analyzer } from "./analyzer.mjs"

/**Recent analyzer */
export class RecentAnalyzer extends Analyzer {
  /**Constructor */
  constructor() {
    super(...arguments)
    this.days = arguments[1]?.days ?? 0
    this.load = arguments[1]?.load ?? 0
    Object.assign(this.results, {days: this.days})
  }

  /**Run analyzer */
  run() {
    return super.run(async () => {
      await this.analyze("/dev/null")
    })
  }

  /**Analyze a repository */
  async analyze(path) {
    const patches = await this.patches()
    return super.analyze(path, {commits: patches})
  }

  /**Fetch patches */
  async patches() {
    //Fetch commits from recent activity
    this.debug(`fetching patches from last ${this.days || ""} days up to ${this.load || "∞"} events`)
    const pages = Math.ceil((this.load || Infinity) / 100)
    if (this.context.mode === "repository") {
      try {
        const {data: {default_branch: branch}} = await this.rest.repos.get(this.context)
        this.context.branch = branch
        this.results.branch = branch
        this.debug(`default branch for ${this.context.owner}/${this.context.repo} is ${branch}`)
      }
      catch (error) {
        this.debug(`failed to get default branch for ${this.context.owner}/${this.context.repo} (${error})`)
      }
    }
    const events = []
    try {
      for (let page = 1; page <= pages; page++) {
        this.debug(`fetching events page ${page}`)
        events.push(
          ...(await (this.context.mode === "repository" ? this.rest.activity.listRepoEvents(this.context) : this.rest.activity.listEventsForAuthenticatedUser({username: this.login, per_page: 100, page}))).data
            .filter(({type, payload}) => (type === "PushEvent") && ((this.context.mode !== "repository") || ((this.context.mode === "repository") && (payload?.ref?.includes?.(`refs/heads/${this.context.branch}`)))))
            .filter(({actor}) => (this.account === "organization") || (this.context.mode === "repository") ? true : !filters.text(actor.login, [this.login], {debug: false}))
            .filter(({repo: {name: repo}}) => !this.ignore(repo))
            .filter(({created_at}) => ((!this.days) || (new Date(created_at) > new Date(Date.now() - this.days * 24 * 60 * 60 * 1000)))),
        )
      }
    }
    catch {
      this.debug("no more page to load")
    }
    this.debug(`fetched ${events.length} events`)

    const wanted = new Map()
    events.forEach(event => {
      let key = `${event.repo.name}@${event.payload.ref}`
      let item = wanted.get(key) ?? { commits: [] }
      item.repo = event.repo.name
      item.ref = event.payload.ref
      item.commits.push(event.payload.before)
      item.commits.push(event.payload.head)
      wanted.set(key, item)
    })

    const commits = []
    for (const item of wanted.values()) {
      try {
        for (let page = 1; page <= pages; page++) {
          this.debug(`fetching commits page ${page}`)
          this.debug(`https://api.github.com/repos/${item.repo}/commits?sha=${item.ref}&per_page=20&page=${page}`)
          commits.push(
            ...(await this.rest.request(`https://api.github.com/repos/${item.repo}/commits?sha=${item.ref}&per_page=20&page=${page}`)).data
              .map(x => {
                item.commits = item.commits.filter(c => c !== x.sha)
                return x
              })
              .filter(({ committer }) => (this.account === "organization") || (this.context.mode === "repository") ? true : !filters.text(committer.login, [this.login], { debug: false }))
              .filter(({ commit }) => ((!this.days) || (new Date(commit.committer.date) > new Date(Date.now() - this.days * 24 * 60 * 60 * 1000)))),
          )
          if (item.commits < 1) {
            this.debug("found expected commits")
            break
          }
        }
      }
      catch {
        this.debug("no more page to load")
      }
    }

    this.debug(`fetched ${commits.length} commits`)
    this.results.latest = Math.round((new Date().getTime() - new Date(events.slice(-1).shift()?.created_at).getTime()) / (1000 * 60 * 60 * 24))
    this.results.commits = commits.length

    //Retrieve edited files and filter edited lines (those starting with +/-) from patches
    this.debug("fetching patches")
    const patches = [
      ...await Promise.allSettled(
        commits
          .filter(({committer}) => filters.text(committer?.email, this.authoring, {debug: false}))
          .map(commit => commit.url)
          .map(async commit => (await this.rest.request(commit)).data),
      ),
    ]
      .filter(({status}) => status === "fulfilled")
      .map(({value}) => value)
      .filter(({parents}) => parents.length <= 1)
      .map(({ sha, commit: { message, author }, verification, files }) => ({
        sha,
        name: `${message} (authored by ${author.name} on ${author.date})`,
        verified: verification?.verified ?? null,
        editions: files.map(({filename, patch = ""}) => {
          const edition = {
            path: filename,
            added: {lines: 0, bytes: 0},
            deleted: {lines: 0, bytes: 0},
            patch,
          }
          for (const line of patch.split("\n")) {
            if ((!/^[-+]/.test(line)) || (!line.trim().length))
              continue
            if (this.markers.line.test(line)) {
              const {op = "+", content = ""} = line.match(this.markers.line)?.groups ?? {}
              const size = Buffer.byteLength(content, "utf-8")
              edition[{"+": "added", "-": "deleted"}[op]].bytes += size
              edition[{"+": "added", "-": "deleted"}[op]].lines++
              continue
            }
          }
          return edition
        }),
      }))
    return patches
  }

  /**Run linguist against a commit and compute edited lines and bytes*/
  async linguist(_, { commit, cache: { languages } }) {
    const cache = { files: {}, languages }
    const result = { total: 0, files: 0, missed: { lines: 0, bytes: 0 }, lines: {}, stats: {}, languages: {} }
    const edited = new Set()
    for (const edition of commit.editions) {
      edited.add(edition.path)

      //Guess file language with linguist
      const { files: { results: files }, languages: { results: languages }, unknown } = await linguist(edition.path, { fileContent: edition.patch })
      Object.assign(cache.files, files)
      Object.assign(cache.languages, languages)
      if (!(edition.path in cache.files))
        cache.files[edition.path] = "<unknown>"

      //Aggregate statistics
      const language = cache.files[edition.path]
      edition.language = language
      const numbers = edition.patch
        .split("\n")
        .filter(line => this.markers.line.test(line))
        .map(line => Buffer.byteLength(line.substring(1).trimStart(), "utf-8"))
      const added = numbers.reduce((a, b) => a + b, 0)
      result.total += added
      if (language === "<unknown>") {
        result.missed.lines += numbers.length
        result.missed.bytes += unknown.bytes
      }
      else {
        result.lines[language] = (result.lines[language] ?? 0) + numbers.length
        result.stats[language] = (result.stats[language] ?? 0) + added
      }
    }
    result.files = edited.size
    result.languages = cache.languages
    return result
  }
}
