// Imports
import { is, Processor, state } from "@processor"
import { extension } from "std/media_types/extension.ts"
import * as Base64 from "std/encoding/base64.ts"
import { parseHandle } from "@utils/parse.ts"
import github from "y/@actions/github@5.1.1"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "📮 Publish to GitHub repository"

  /** Category */
  readonly category = "publisher"

  /** Description */
  readonly description = "Publish content to a GitHub repository"

  /** Inputs */
  readonly inputs = is.object({
    repository: is.string().default("lowlighter/lol"),
    commit: is.union([
      is.literal(false),
      is.object({
        message: is.string().default("chore: update ${filename}"),
        branch: is.string().default("metrics"),
        base: is.string().default("main"),
      }),
    ]).default(() => ({})),
    pullrequest: is.union([
      is.literal(false),
      is.object({
        title: is.string().default("chore: update metrics ${run}"),
        message: is.string().default("This pull request has been automatically opened by [metrics](https://github.com/lowlighter/metrics) to update generated renders on this repository"),
        merge: is.union([is.enum(["commit", "squash", "rebase"]), is.literal(false)]).default(false),
        branch: is.string().default("metrics"),
        base: is.string().default("main"),
      }),
    ]).default(false),
    filepath: is.string().default("metrics.*").describe("Target filename (use `*` to automatically match detected filetype extension)"),
  })

  /** Supports */
  readonly supports = ["application/xml", "image/svg+xml", "image/png", "image/jpeg", "image/webp", "application/json", "text/html", "application/pdf", "text/plain"]

  /** Does this processor needs to perform requests ? */
  protected requesting = true

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { mime, base64 } = result
    const { commit, filepath, repository, pullrequest } = await this.inputs.parseAsync(this.context.args)
    let file = filepath
    if (mime) {
      const ext = extension(mime) ?? ""
      this.log.trace(`using extension: ${ext} for ${mime}`)
      file = file.replaceAll("*", ext)
    }
    const { owner, name: repo } = parseHandle(repository, { entity: "repository" }) as { owner: string; name: string }
    const { repository: { id } } = await this.requests.graphql("repository", { owner, repo })
    this.log.probe(`repository id: ${id}`)

    // Git commits
    if (commit) {
      // Fetch last commit
      const { head: base } = await this.peak({ owner, repo, branch: commit.base, file })
      let { head, revision } = await this.peak({ owner, repo, branch: commit.branch, file })
      if (!head) {
        this.log.probe(`creating branch ${commit.branch}: at ${base}`)
        const { mutation: { ref } } = await this.requests.graphql("createref", { branch: `refs/heads/${commit.branch}`, base, repository: id })
        this.log.probe(`created ${ref.name}`)
        head = base
      }

      // Compute object hash
      this.log.probe(`committing ${file} to ${commit.branch}`)
      const header = new TextEncoder().encode(`blob ${result.content.length}\0`)
      const blob = base64 ? Base64.decode(result.content) : new TextEncoder().encode(result.content)
      const object = new Uint8Array(header.length + blob.length)
      object.set(header)
      object.set(blob, header.length)
      const oid = [...new Uint8Array(await crypto.subtle.digest("SHA-1", object))].map((byte) => byte.toString(16).padStart(2, "0")).join("")
      this.log.probe(`${file}~HEAD: ${oid}`)
      this.log.probe(`${file}@${commit.branch}: ${revision?.oid ?? "(not created yet)"}`)
      if ((!revision) || (oid !== revision.oid)) {
        this.log.probe(`uploading new revision of ${file}@${commit.branch}`)
        const contents = base64 ? result.content : Base64.encode(result.content)
        const { mutation: { commit: { oid } } } = await this.requests.graphql("commit", {
          repository,
          branch: commit.branch,
          message: commit.message.replaceAll("${filename}", file),
          path: file,
          contents,
          head,
        })
        this.log.probe(`${file}@${commit.branch}: now at ${oid}`)
      }
    }

    // Git pull requests
    if (pullrequest) {
      this.log.probe(`creating pull request from ${pullrequest.branch} to ${pullrequest.base}`)
      try {
        const { mutation: { pullRequest: { number: pr } } } = await this.requests.graphql("pullrequest", {
          title: pullrequest.title.replaceAll("${run}", `${github.context.runId ?? ""}`),
          message: pullrequest.message,
          head: pullrequest.branch,
          base: pullrequest.base,
          repository: id,
        })
        this.log.probe(`opened #${pr}`)
      } catch (error) {
        if (/a pull request already exists/i.test(error)) {
          this.log.probe(".....")
        }
      }
      if (pullrequest.merge) {
        //TODO(@lowlighter): implement merging is.enum(["open", "commit", "squash", "rebase"]),
      }
    }
  }

  /** Peak head of repository */
  private async peak({ owner, repo, branch, file }: { owner: string; repo: string; branch: string; file: string }) {
    const { repository: { branch: ref, revision } } = await this.requests.graphql("head", { owner, repo, branch, file: `${branch}:${file}` })
    const head = ref?.history.commits[0].oid
    this.log.probe(`${file}@${branch}: ${head ? `at ${head}` : "(not created yet)"}`)
    return { branch: ref, revision, head }
  }
}

/*
//Pull request
if (committer.pr) {
  //Create pull request
  let number = null
  await retry(async () => {
    try {
      ;({data: {number}} = await committer.rest.pulls.create({...github.context.repo, head: committer.head, base: committer.branch, title: `Auto-generated metrics for run #${github.context.runId}`, body: " ", maintainer_can_modify: true}))
      info(`Pull request from ${committer.head} to ${committer.branch}`, "(created)")
    }
    catch (error) {
      console.debug(error)
      //Check if pull request has already been created previously
      if (/A pull request already exists/.test(error)) {
        info(`Pull request from ${committer.head} to ${committer.branch}`, "(already existing)")
        const q = `repo:${github.context.repo.owner}/${github.context.repo.repo}+type:pr+state:open+Auto-generated metrics for run #${github.context.runId}+in:title`
        const prs = (await committer.rest.search.issuesAndPullRequests({q})).data.items.filter(({user: {login}}) => login === "github-actions[bot]")
        if (prs.length < 1)
          throw new Error("0 matching prs. Cannot proceed.")
        if (prs.length > 1)
          throw new Error(`Found more than one matching prs: ${prs.map(({number}) => `#${number}`).join(", ")}. Cannot proceed.`)
        ;({number} = prs.shift())
      }
      //Check if pull request could not been created because there are no diff between head and base
      else if (/No commits between/.test(error)) {
        info(`Pull request from ${committer.head} to ${committer.branch}`, "(no diff)")
        committer.merge = false
        number = "(none)"
      }
      else {
        throw error
      }
    }
    info("Pull request number", number)
  }, {retries: retries_output_action, delay: retries_delay_output_action})
  //Merge pull request
  if (committer.merge) {
    info("Merge method", committer.merge)
    let attempts = 240
    do {
      const success = await retry(async () => {
        //Check pull request mergeability (https://octokit.github.io/rest.js/v18#pulls-get)
        const {data: {mergeable, mergeable_state: state}} = await committer.rest.pulls.get({...github.context.repo, pull_number: number})
        console.debug(`Pull request #${number} mergeable state is "${state}"`)
        if (mergeable === null) {
          await wait(15)
          return false
        }
        if (!mergeable)
          throw new Error(`Pull request #${number} is not mergeable (state is "${state}")`)
        //Merge pull request
        await committer.rest.pulls.merge({...github.context.repo, pull_number: number, merge_method: committer.merge})
        info(`Merge #${number} to ${committer.branch}`, "ok")
        return true
      }, {retries: retries_output_action, delay: retries_delay_output_action})
      if (!success)
        continue
      //Delete head branch
      await retry(async () => {
        try {
          await wait(15)
          await committer.rest.git.deleteRef({...github.context.repo, ref: `heads/${committer.head}`})
        }
        catch (error) {
          console.debug(error)
          if (!/reference does not exist/i.test(`${error}`))
            throw error
        }
        info(`Branch ${committer.head}`, "(deleted)")
      }, {retries: retries_output_action, delay: retries_delay_output_action})
      break
    }
    while (--attempts)
  }
}*/
