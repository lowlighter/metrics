//Imports
import { Analyzer } from "./analyzer.mjs"
import fs from "fs/promises"
import os from "os"
import paths from "path"
//import fetch from "node-fetch"

/**Recent analyzer */
export class RecentAnalyzer extends Analyzer {
  /**Constructor */
  constructor() {
    super(...arguments)
    Object.assign(this.results, {days:arguments[1]?.days ?? 0})
  }

  /**Run analyzer */
  run({categories, tempdir, load}) {
    return super.run(async () => {
      tempdir = `${this.uid}-${tempdir || "recent"}`
      await this.patches({tempdir, load})
      for (const directory of await fs.readdir(tempdir)) {
        if (this.results.partial)
          break
        await this.analyze(directory, {categories})
      }
      await this.clean(tempdir)
    })
  }

  /**Fetch patches */
  async patches({tempdir, load = 0}) {
    //Fetch commits from recent activity
    this.debug("fetching patches")
    const commits = [], pages = Math.ceil(load / 100)
    try {
      for (let page = 1; page <= pages; page++) {
        this.debug(`fetching events page ${page}`)
        commits.push(
          ...(await this.rest.activity.listEventsForAuthenticatedUser({username: this.login, per_page: 100, page})).data
            .filter(({type}) => type === "PushEvent")
            .filter(({actor}) => this.account === "organization" ? true : actor.login?.toLocaleLowerCase() === this.login?.toLocaleLowerCase())
            .filter(({repo: {name: repo}}) => !this.ignore({name:repo.split("/").pop(), owner:{login:repo.split("/").shift()}}))
            .filter(({created_at}) => new Date(created_at) > new Date(Date.now() - this.results.days * 24 * 60 * 60 * 1000)),
        )
      }
    }
    catch {
      this.debug("no more page to load")
    }
    this.debug(`fetched ${commits.length} commits`)
    this.results.latest = Math.round((new Date().getTime() - new Date(commits.slice(-1).shift()?.created_at).getTime()) / (1000 * 60 * 60 * 24))
    this.results.commits = commits.length

    //Retrieve edited files and filter edited lines (those starting with +/-) from patches
    this.debug("fetching patches")
    let patches = [
      ...await Promise.allSettled(
        commits
          .flatMap(({payload}) => payload.commits)
          .filter(({author}) => this.authoring.filter(authoring => author?.login?.toLocaleLowerCase().includes(authoring) || author?.email?.toLocaleLowerCase().includes(authoring) || author?.name?.toLocaleLowerCase().includes(authoring)).length)
          .map(commit => commit.url)
          .map(async commit => (await this.rest.request(commit)).data),
      ),
    ]
      .filter(({status}) => status === "fulfilled")
      .map(({value}) => value)
      .filter(({parents}) => parents.length <= 1)
      .map(({files}) => files)
      .flatMap(files => files.map(file => ({name: paths.basename(file.filename), directory: paths.dirname(file.filename), patch: file.patch ?? "", repo: file.raw_url?.match(/(?<=^https:..github.com\/)(?<repo>.*)(?=\/raw)/)?.groups.repo ?? "_"})))
      .map(({name, directory, patch, repo}) => ({name, directory: `${repo.replace(/[/]/g, "@")}/${directory}`, patch: patch.split("\n").filter(line => /^[+]/.test(line)).map(line => line.substring(1)).join("\n")}))

    //Save patches to directory
    const path = paths.join(os.tmpdir(), tempdir)
    this.debug(`saving ${patches.length} files to ${path}`)
    /*
    try {

      await fs.rm(path, {recursive: true, force: true})
      await fs.mkdir(path, {recursive: true})
      await Promise.all(patches.map(async ({name, directory, patch}) => {
        await fs.mkdir(paths.join(path, directory), {recursive: true})
        await fs.writeFile(paths.join(path, directory, name), patch)
      }))


      for (const directory of await fs.readdir(path)) {
        for (const branch of ["main", "master"]) {
          const repo = directory.replace("@", "/")
          try {
            await fs.writeFile(paths.join(path, directory, ".gitattributes"), await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/.gitattributes`).then(response => response.text()).catch(() => ""))
            this.debug(`successfully fetched .gitattributes for ${repo}`)
            break
          }
          catch {
            this.debug(`could not load .gitattributes on branch ${branch} for ${repo}`)
          }
        }
      }
    }
    catch {

    }*/

  }

}
