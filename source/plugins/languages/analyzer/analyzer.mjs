//Imports
import fs from "fs/promises"
import os from "os"
import paths from "path"
import git from "simple-git"
import filters from "../../../app/metrics/utils.mjs"
//import linguist from "linguist-js"

/**Analyzer */
export class Analyzer {

  /**Constructor */
  constructor(login, {account = "bypass", authoring = [], uid = Math.random(), shell, rest = null, skipped = [], timeout = {global:NaN, repository:NaN}}) {
    //User informations
    this.login = login
    this.account = account
    this.authoring = authoring
    this.uid = uid
    this.gpg = []

    //Utilities
    this.shell = shell
    this.rest = rest

    //Options
    this.skipped = skipped
    this.timeout = timeout

    //Results
    this.results = {partial: false, total: 0, lines: {}, stats: {}, colors: {}, commits: 0, files: 0, missed: {lines: 0, bytes: 0, commits: 0}}
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
    const repo = `${repository.owner.login}/${repository.name}`
    const path = paths.join(os.tmpdir(), `${this.uid}-${repo.replace(/[^\w]/g, "_")}`)
    return {repo, path}
  }

  /**Clone a repository */
  async clone(repository) {
    const {path} = this.parse(repository)
    try {
      this.debug(`cloning ${repo} to ${path}`)
      await fs.rm(path, {recursive: true, force: true})
      await fs.mkdir(path, {recursive: true})
      await git(path).clone(`https://github.com/${repo}`, ".").status()
      this.debug(`cloned ${repo} to ${path}`)
      return true
    }
    catch (error) {
      this.debug(`failed to clone ${repo} (${error})`)
      return false
    }
  }

  /**Filter commits in repository */
  async filter(path) {
    const commits = []
    try {
      this.debug(`filtering commits authored by ${this.login} in ${path}`)
      //TODO, this.authoring, etc.
      return commits
    }
    catch (error) {
      this.debug(`an error occurred during filtering of commits authored by ${this.login} in ${path} (${error})`)
      return commits
    }
  }

  /**Analyze a repository */
  async analyze(path, {categories}) { //eslint-disable-line no-unused-vars
    //TODO
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
    if ((this.skipped.includes(repository.name.toLocaleLowerCase())) || (this.skipped.includes(`${repository.owner.login}/${repository.name}`.toLocaleLowerCase()))) {
      this.debug(`skipped repository ${repository.owner.login}/${repository.name}`)
      return true
    }
    return false
  }

  /**Debug log */
  debug(message) {
    return console.debug(`metrics/compute/${this.login}/plugins > languages > indepth > ${message}`)
  }

}

/*
async function analyze({login, imports, data}, {results, path, categories = ["programming", "markup"]}) {
  //Gather language data
  console.debug(`metrics/compute/${login}/plugins > languages > indepth > running linguist`)
  const {files: {results: files}, languages: {results: languageResults}} = await linguist(path)
  Object.assign(results.colors, Object.fromEntries(Object.entries(languageResults).map(([lang, {color}]) => [lang, color])))

  //Processing diff
  const per_page = 1
  const edited = new Set()
  console.debug(`metrics/compute/${login}/plugins > languages > indepth > checking git log`)
  try {
    await imports.run("git log --max-count=1", {cwd: path})
  }
  catch {
    console.debug(`metrics/compute/${login}/plugins > languages > indepth > repo seems empty or impossible to git log, skipping`)
    return
  }
  const pending = []
  for (let page = 0;; page++) {
    try {
      console.debug(`metrics/compute/${login}/plugins > languages > indepth > processing commits ${page * per_page} from ${(page + 1) * per_page}`)
      let empty = true, file = null, lang = null
      await imports.spawn("git", ["log", ...data.shared["commits.authoring"].map(authoring => `--author="${authoring}"`), "--regexp-ignore-case", "--format=short", "--no-merges", "--patch", `--max-count=${per_page}`, `--skip=${page * per_page}`], {cwd: path}, {
        stdout(line) {
          try {
            //Unflag empty output
            if ((empty) && (line.trim().length))
              empty = false
            //Commits counter
            if (/^commit [0-9a-f]{40}$/.test(line)) {
              if (results.verified) {
                const sha = line.match(/[0-9a-f]{40}/)?.[0]
                if (sha) {
                  pending.push(
                    imports.run(`git verify-commit ${sha}`, {cwd: path, env: {LANG: "en_GB"}}, {log: false, prefixed: false})
                      .then(() => results.verified.signature++)
                      .catch(() => null),
                  )
                }
              }
              results.commits++
              return
            }
            //Ignore empty lines or unneeded lines
            if ((!/^[+]/.test(line)) || (!line.length))
              return
            //File marker
            if (/^[+]{3}\sb[/](?<file>[\s\S]+)$/.test(line)) {
              file = `${path}/${line.match(/^[+]{3}\sb[/](?<file>[\s\S]+)$/)?.groups?.file}`.replace(/\\/g, "/")
              lang = files[file] ?? "<unknown>"
              if ((lang) && (lang !== "<unknown>") && (!categories.includes(languageResults[lang].type)))
                lang = null
              edited.add(file)
              return
            }
            //Ignore unknown languages
            if (!lang)
              return
            //Added line marker
            if (/^[+]\s*(?<line>[\s\S]+)$/.test(line)) {
              const size = Buffer.byteLength(line.match(/^[+]\s*(?<line>[\s\S]+)$/)?.groups?.line ?? "", "utf-8")
              results.total += size
              if (lang === "<unknown>") {
                results.missed.lines++
                results.missed.bytes += size
              }
              else {
                results.stats[lang] = (results.stats[lang] ?? 0) + size
                results.lines[lang] = (results.lines[lang] ?? 0) + 1
              }
            }
          }
          catch (error) {
            console.debug(`metrics/compute/${login}/plugins > languages > indepth > an error occurred while processing line (${error.message}), skipping...`)
          }
        },
      })
      if (empty) {
        console.debug(`metrics/compute/${login}/plugins > languages > indepth > no more commits`)
        break
      }
    }
    catch {
      console.debug(`metrics/compute/${login}/plugins > languages > indepth > an error occurred on page ${page}, skipping...`)
      results.missed.commits += per_page
    }
  }
  await Promise.allSettled(pending)
  results.files += edited.size
}
*/