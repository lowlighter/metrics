//Imports
import fs from "fs/promises"
import os from "os"
import paths from "path"
import git from "simple-git"
import { filters } from "../../../app/metrics/utils.mjs"

/**Analyzer */
export class Analyzer {
  /**Constructor */
  constructor(login, {account = "bypass", authoring = [], uid = Math.random(), shell, rest = null, context = {mode: "user"}, skipped = [], categories = ["programming", "markup"], timeout = {global: NaN, repositories: NaN}}) {
    //User informations
    this.login = login
    this.account = account
    this.authoring = authoring
    this.uid = uid
    this.gpg = []

    //Utilities
    this.shell = shell
    this.rest = rest
    this.context = context
    this.markers = {
      hash: /\b[0-9a-f]{40}\b/,
      file: /^[+]{3}\sb[/](?<file>[\s\S]+)$/,
      line: /^(?<op>[-+])\s*(?<content>[\s\S]+)$/,
    }
    this.parser = /^(?<login>[\s\S]+?)\/(?<name>[\s\S]+?)(?:@(?<branch>[\s\S]+?)(?::(?<ref>[\s\S]+))?)?$/
    this.consumed = false

    //Options
    this.skipped = skipped
    this.categories = categories
    this.timeout = timeout

    //Results
    this.results = {partial: {global: false, repositories: false}, total: 0, lines: {}, stats: {}, colors: {}, commits: 0, files: 0, missed: {lines: 0, bytes: 0, commits: 0}, elapsed: 0}
    this.debug(`instantiated a new ${this.constructor.name}`)
  }

  /**Run analyzer */
  async run(runner) {
    if (this.consumed)
      throw new Error("This analyzer has already been consumed, another instance needs to be created to perform a new analysis")
    this.consumed = true
    const results = await new Promise(async solve => {
      let completed = false
      if (Number.isFinite(this.timeout.global)) {
        this.debug(`timeout set to ${this.timeout.global}m`)
        setTimeout(() => {
          if (!completed) {
            try {
              this.debug(`reached maximum execution time of ${this.timeout.global}m for analysis`)
              this.results.partial.global = true
              solve(this.results)
            }
            catch {
              //Ignore errors
            }
          }
        }, this.timeout.global * 60 * 1000)
      }
      await runner()
      completed = true
      solve(this.results)
    })
    return results
  }

  /**Parse repository */
  parse(repository) {
    let branch = null, ref = null
    if (typeof repository === "string") {
      if (!this.parser.test(repository))
        throw new TypeError(`"${repository}" pattern is not supported`)
      const {login, name, ...groups} = repository.match(this.parser)?.groups ?? {}
      repository = {owner: {login}, name}
      branch = groups.branch ?? null
      ref = groups.ref ?? null
    }
    const repo = `${repository.owner.login}/${repository.name}`
    const path = paths.join(os.tmpdir(), `${this.uid}-${repo.replace(/[^\w]/g, "_")}`)
    return {repo, path, branch, ref}
  }

  /**Clone a repository */
  async clone(repository) {
    const {repo, branch, path} = this.parse(repository)
    let url = /^https?:\/\//.test(repo) ? repo : `https://github.com/${repo}`
    try {
      this.debug(`cloning ${url} to ${path}`)
      await fs.rm(path, {recursive: true, force: true})
      await fs.mkdir(path, {recursive: true})
      await git(path).clone(url, ".", ["--single-branch"]).status()
      this.debug(`cloned ${url} to ${path}`)
      if (branch) {
        this.debug(`switching to branch ${branch} for ${repo}`)
        await git(path).branch(branch)
      }
      return true
    }
    catch (error) {
      this.debug(`failed to clone ${url} (${error})`)
      this.clean(path)
      return false
    }
  }

  /**Analyze a repository */
  async analyze(path, {commits = []} = {}) {
    const cache = {files: {}, languages: {}}
    const start = Date.now()
    let elapsed = 0, processed = 0
    if (this.timeout.repositories)
      this.debug(`timeout for repository analysis set to ${this.timeout.repositories}m`)
    for (const commit of commits) {
      elapsed = (Date.now() - start) / 1000 / 60
      if ((this.timeout.repositories) && (elapsed > this.timeout.repositories)) {
        this.results.partial.repositories = true
        this.debug(`reached maximum execution time of ${this.timeout.repositories}m for repository analysis (${elapsed}m elapsed)`)
        break
      }
      try {
        const {total, files, missed, lines, stats} = await this.linguist(path, {commit, cache})
        this.results.commits++
        this.results.total += total
        this.results.files += files
        this.results.missed.lines += missed.lines
        this.results.missed.bytes += missed.bytes
        for (const language in lines) {
          if (this.categories.includes(cache.languages[language]?.type))
            this.results.lines[language] = (this.results.lines[language] ?? 0) + lines[language]
        }
        for (const language in stats) {
          if (this.categories.includes(cache.languages[language]?.type))
            this.results.stats[language] = (this.results.stats[language] ?? 0) + stats[language]
        }
      }
      catch (error) {
        this.debug(`skipping commit ${commit.sha} (${error})`)
        this.results.missed.commits++
      }
      finally {
        this.results.elapsed += elapsed
        processed++
        if ((processed % 50 === 0) || (processed === commits.length))
          this.debug(`at commit ${processed}/${commits.length} (${(100 * processed / commits.length).toFixed(2)}%, ${elapsed.toFixed(2)}m elapsed)`)
      }
    }
    this.results.colors = Object.fromEntries(Object.entries(cache.languages).map(([lang, {color}]) => [lang, color]))
  }

  /**Clean a path */
  async clean(path) {
    try {
      this.debug(`cleaning ${path}`)
      await fs.rm(path, {recursive: true, force: true})
      this.debug(`cleaned ${path}`)
      return true
    }
    catch (error) {
      this.debug(`failed to clean (${error})`)
      return false
    }
  }

  /**Whether to skip a repository or not */
  ignore(repository) {
    const ignored = !filters.repo(repository, this.skipped)
    if (ignored)
      this.debug(`skipping ${typeof repository === "string" ? repository : `${repository?.owner?.login}/${repository?.name}`} as it matches skipped repositories`)
    return ignored
  }

  /**Debug log */
  debug(message) {
    return console.debug(`metrics/compute/${this.login}/plugins > languages > ${this.constructor.name.replace(/([a-z])([A-Z])/, (_, a, b) => `${a} ${b.toLocaleLowerCase()}`).toLocaleLowerCase()} > ${message}`)
  }
}
