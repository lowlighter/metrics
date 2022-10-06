//Imports
import fs from "fs/promises"
import os from "os"
import paths from "path"
import git from "simple-git"
import {filters} from "../../../app/metrics/utils.mjs"

/**Analyzer */
export class Analyzer {

  /**Constructor */
  constructor(login, {account = "bypass", authoring = [], uid = Math.random(), shell, rest = null, skipped = [], categories = ["programming", "markup"], timeout = {global:NaN, repository:NaN}}) {
    //User informations
    this.login = login
    this.account = account
    this.authoring = authoring
    this.uid = uid
    this.gpg = []

    //Utilities
    this.shell = shell
    this.rest = rest
    this.markers = {
      hash:/\b[0-9a-f]{40}\b/,
      file:/^[+]{3}\sb[/](?<file>[\s\S]+)$/,
      line:/^(?<op>[-+])\s*(?<content>[\s\S]+)$/,
    }
    this.parser = /^(?<login>[\s\S]+?)\/(?<name>[\s\S]+?)(?:@(?<branch>[\s\S]+?)(?::(?<ref>[\s\S]+))?)?$/

    //Options
    this.skipped = skipped
    this.categories = categories
    this.timeout = timeout

    //Results
    this.results = {partial: false, total: 0, lines: {}, stats: {}, colors: {}, commits: 0, files: 0, missed: {lines: 0, bytes: 0, commits: 0}}
    this.debug(`instantiated a new ${this.constructor.name}`)
  }

  /**Run analyzer */
  async run(runner) {
    return new Promise(async solve => {
      if (Number.isFinite(this.timeout.global)) {
        this.debug(`timeout set to ${this.timeout.global}m`)
        setTimeout(() => {
          this.results.partial = true
          this.debug(`reached maximum execution time of ${this.timeout.global}m for analysis`)
          solve(this.results)
        }, this.timeout.global * 60 * 1000)
      }
      await runner()
      solve(this.results)
    })
  }

  /**Parse repository */
  parse(repository) {
    let branch = null, ref = null
    if (typeof repository === "string") {
      if (!this.parser.test(repository))
        throw new TypeError(`"${repository}" pattern is not supported`)
      const {login, name, ...groups} = repository.match(this.parser)?.groups ?? {}
      repository = {owner:{login}, name}
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
      return false
    }
  }

  /**Analyze a repository */
  async analyze(path, {commits = []} = {}) {
    const cache = {files:{}, languages:{}}
    for (const commit of commits) {
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
        console.log(error)
        this.debug(`skipping commit ${commit.sha} (${error})`)
        this.results.missed.commits++
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
      this.debug(`skipping ${repository} as it matches skipped repositories`)
    return ignored
  }

  /**Debug log */
  debug(message) {
    return console.debug(`metrics/compute/${this.login}/plugins > languages > indepth > ${message}`)
  }

}
