//Imports
import { Analyzer } from "./analyzer.mjs"
import fs from "fs/promises"
import os from "os"
import paths from "path"

/**Indepth analyzer */
export class IndepthAnalyzer extends Analyzer {
  /**Constructor */
  constructor() {
    super(...arguments)
    Object.assign(this.results, {verified: {signature: 0}})
  }

  /**Run analyzer */
  run({repositories, categories}) {
    return super.run(async () => {
      await this.gpgarmor()
      for (const repository of repositories) {
        if (this.results.partial)
          break
        if (this.ignore(repository))
          continue
        if (await this.clone(repository)) {
          const {path} = this.parse(repository)
          await this.analyze(path, {categories})
          await this.clean(path)
        }
      }
    })
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
    if (process.env.GITHUB_ACTIONS) {
      this.debug("importing gpg keys as we are in GitHub Actions environment")
      for (const {id, pub} of this.gpg) {
        const path = paths.join(os.tmpdir(), `${this.uid}.${id}.gpg`)
        try {
          this.debug(`saving gpg ${id} to ${path}`)
          await fs.writeFile(path, pub)
          this.debug(`importing gpg ${id}`)
          await this.shell.run(`gpg --import ${path}`)
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
    else
      this.debug("skipping import of gpg keys as we are not in GitHub Actions environment")
  }

}

