//Imports
import { Analyzer } from "./analyzer.mjs"
import fs from "fs/promises"
import os from "os"
import paths from "path"
import linguist from "linguist-js"

/**Indepth analyzer */
export class IndepthAnalyzer extends Analyzer {
  /**Constructor */
  constructor() {
    super(...arguments)
    this.manual = {repositories:[]}
    Object.assign(this.results, {verified: {signature: 0}})
  }

  /**Run analyzer */
  run({repositories}) {
    this.manual.repositories = repositories.filter(repo => typeof repo === "string")
    return super.run(async () => {
      await this.gpgarmor()
      for (const repository of repositories) {
        if (this.results.partial.global)
          break
        if (this.ignore(repository))
          continue
        if (await this.clone(repository)) {
          const {path, ref} = this.parse(repository)
          await this.analyze(path, {ref})
          await this.clean(path)
        }
      }
    })
  }

  /**Whether to skip a repository or not (bypass filter if repository was manually specified)*/
  ignore(repository) {
    if (this.manual.repositories.includes(repository)) {
      this.debug(`${repository} has been specified manually, not skipping`)
      return false
    }
    return super.ignore(repository)
  }

  /**Populate gpg keys */
  async gpgarmor() {
    //Fetch gpg keys (web-flow is GitHub's public key when making changes from web ui)
    try {
      this.debug("fetching gpg keys")
      for (const username of [this.login, "web-flow"]) {
        const {data: keys} = await this.rest.users.listGpgKeysForUser({username})
        this.gpg.push(...keys.map(({key_id: id, raw_key: pub, emails}) => ({id, pub, emails})))
        if (username === this.login) {
          for (const {email} of this.gpg.flatMap(({emails}) => emails)) {
            this.debug(`auto-adding ${email} to commits_authoring (fetched from gpg)`)
            this.authoring.push(email)
          }
        }
      }
      this.debug(`fetched ${this.gpg.length} gpg keys`)
    }
    catch (error) {
      this.debug(`an error occurred while fetching gpg keys (${error})`)
    }

    //Import gpg keys
    for (const {id, pub} of this.gpg) {
      const path = paths.join(os.tmpdir(), `${this.uid}.${id}.gpg`)
      try {
        this.debug(`saving gpg ${id} to ${path}`)
        await fs.writeFile(path, pub)
        await this.shell.run(`gpg ${path}`)
        if (process.env.GITHUB_ACTIONS) {
          this.debug(`importing gpg ${id}`)
          await this.shell.run(`gpg --import ${path}`)
        }
        else
          this.debug("skipping import of gpg keys as we are not in GitHub Actions environment")
      }
      catch (error) {
        this.debug(`an error occurred while importing gpg ${id}, skipping...`)
      }
      finally {
        this.debug(`cleaning ${path}`)
        await fs.rm(path, {recursive: true, force: true}).catch(error => this.debug(`failed to clean ${path} (${error})`))
      }
    }
  }

  /**Filter related commits in repository */
  async filter(path, {ref}) {
    const commits = new Set()
    try {
      this.debug(`filtering commits authored by ${this.login} in ${path}`)
      for (const author of this.authoring) {
        //Search by --author
        {
          const output = await this.shell.run(`git log --author='${author}' --pretty=format:"%H" --regexp-ignore-case --no-merges`, {cwd:path, env: {LANG: "en_GB"}}, {log:false, debug:false, prefixed: false})
          const hashes = output.split("\n").map(line => line.trim()).filter(line => this.markers.hash.test(line))
          hashes.forEach(hash => commits.add(hash))
          this.debug(`found ${hashes.length} for ${author} (using --author)`)
        }
        //Search by --grep
        {
          const output = await this.shell.run(`git log --grep='${author}' --pretty=format:"%H"  --regexp-ignore-case --no-merges`, {cwd:path, env: {LANG: "en_GB"}}, {log:false, debug:false, prefixed: false})
          const hashes = output.split("\n").map(line => line.trim()).filter(line => this.markers.hash.test(line))
          hashes.forEach(hash => commits.add(hash))
          this.debug(`found ${hashes.length} for ${author} (using --grep)`)
        }
      }
      //Apply ref range if specified
      if (ref) {
        this.debug(`filtering commits referenced by ${ref} in ${path}`)
        const output = await this.shell.run(`git rev-list --boundary ${ref}`, {cwd:path, env: {LANG: "en_GB"}}, {log:false, debug:false, prefixed: false})
        const hashes = output.split("\n").map(line => line.trim()).filter(line => this.markers.hash.test(line))
        commits.forEach(commit => !hashes.includes(commit) ? commits.delete(commit) : null)
      }
      this.debug(`found ${commits.size} unique commits authored by ${this.login} in ${path}`)
    }
    catch (error) {
      this.debug(`an error occurred during filtering of commits authored by ${this.login} in ${path} (${error})`)
    }
    return [...commits]
  }

  /**Filter commits in repository */
  async commits(path, {ref}) {
    const shas = await this.filter(path, {ref})
    const commits = []
    for (const sha of shas) {
      try {
        commits.push({
          sha,
          name: await this.shell.run(`git log ${sha} --format="%s (authored by %an on %cI)" --max-count=1`, {cwd: path, env: {LANG: "en_GB"}}, {log: false, debug:false, prefixed: false}),
          verified: ("verified" in this.results) ?  await this.shell.run(`git verify-commit ${sha}`, {cwd: path, env: {LANG: "en_GB"}}, {log: false, debug:false, prefixed: false}).then(() => true).catch(() => null) : null,
          editions: await this.editions(path, {sha}),
        })
      }
      catch (error) {
        this.debug(`skipping commit ${sha} (${error})`)
      }
    }
    return commits
  }

  /**Fetch commit patch and format it by files*/
  async editions(path, {sha}) {
    const editions = []
    let edition = null
    let cursor = 0
    await this.shell.spawn("git", ["log", sha, "--format=''", "--max-count=1", "--patch"], {cwd: path, env: {LANG: "en_GB"}}, {
      debug:false,
      stdout:line => {
        try {
          //Ignore empty lines or unneeded lines
          cursor++
          if ((!/^[-+]/.test(line)) || (!line.trim().length))
            return

          //File marker
          if (this.markers.file.test(line)) {
            edition = {
              path: `${path}/${line.match(this.markers.file)?.groups?.file}`.replace(/\\/g, "/"),
              added: {lines:0, bytes:0},
              deleted: {lines:0, bytes:0},
            }
            editions.push(edition)
            return
          }

          //Line markers
          if ((edition)&&(this.markers.line.test(line))) {
            const {op = "+", content = ""} = line.match(this.markers.line)?.groups ?? {}
            const size = Buffer.byteLength(content, "utf-8")
            edition[{"+":"added", "-":"deleted"}[op]].bytes += size
            edition[{"+":"added", "-":"deleted"}[op]].lines++
            return
          }
        }
        catch (error) {
          this.debug(`skipping line ${sha}#${cursor} (${error})`)
        }
      }
    })
    return editions
  }

  /**Analyze a repository */
  async analyze(path, {ref} = {}) {
    const commits = await this.commits(path, {ref})
    return super.analyze(path, {commits})
  }

  /**Run linguist against a commit and compute edited lines and bytes*/
  async linguist(path, {commit, cache}) {
    const result = {total:0, files:0, missed:{lines:0, bytes:0}, lines:{}, stats:{}}
    const edited = new Set()
    const seen = new Set()
    for (const edition of commit.editions) {
      edited.add(edition.path)

      //Guess file language with linguist (only run it once per sha)
      if ((!(edition.path in cache.files))&&(!seen.has(commit.sha))) {
        this.debug(`language for file ${edition.path} is not in cache, running linguist at ${commit.sha}`)
        await this.shell.run(`git checkout ${commit.sha}`, {cwd: path, env: {LANG: "en_GB"}}, {log: false, debug:false, prefixed: false})
        const {files: {results: files}, languages: {results: languages}} = await linguist(path)
        Object.assign(cache.files, files)
        Object.assign(cache.languages, languages)
        seen.add(commit.sha)
      }
      if (!(edition.path in cache.files))
        cache.files[edition.path] = "<unknown>"

      //Aggregate statistics
      const language = cache.files[edition.path]
      edition.language = language
      result.total += edition.added.bytes
      if (language === "<unknown>") {
        result.missed.lines += edition.added.lines
        result.missed.bytes += edition.added.bytes
      }
      else {
        result.lines[language] = (result.lines[language] ?? 0) + edition.added.lines
        result.stats[language] = (result.stats[language] ?? 0) + edition.added.bytes
      }
    }
    result.files = edited.size
    return result
  }

}

