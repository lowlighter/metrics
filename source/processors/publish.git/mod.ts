// Imports
import { is, parse, Processor, state } from "@engine/components/processor.ts"
import { extension } from "std/media_types/extension.ts"
import { decodeBase64, encodeBase64 } from "std/encoding/base64.ts"
import { parseHandle } from "@engine/utils/github.ts"
import github from "y/@actions/github@5.1.1?pin=v133"
import { throws } from "@engine/utils/errors.ts"
import { delay } from "std/async/delay.ts"

/** Processor */
export default class _ extends Processor {
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
    repository: is.string().describe("Target repository (e.g. `octocat/hello-world`)"),
    commit: is.union([
      is.literal(false).describe("Disable commit"),
      is.object({
        message: is.string().default("chore: update ${file} (${run})").describe("Commit message. `${file}` and `${run}` will respectively be replaced by target filename and current run id"),
        to: is.string().default("metrics").describe("Branch where content will be committed"),
        base: is.string().default("main").describe(
          "Base branch to create automatically `commit.branch` if it does not exist yet (e.g. `main`). Empty repositories and orphan branches must be setup manually as it is currently not possible to automate this process through GitHub API yet",
        ),
      }).describe("Commit changes to repository"),
    ]).default(false),
    pullrequest: is.union([
      is.literal(false).describe("Disable pull request"),
      is.object({
        title: is.string().default("chore: update metrics (${run})").describe("Pull request title. `${file}` and `${run}` will respectively be replaced by target filename and current run id"),
        message: is.string().default("This pull request has been automatically opened by [metrics](https://github.com/lowlighter/metrics) to update generated renders on this repository").describe(
          "Pull request message. `${file}` and `${run}` will respectively be replaced by target filename and current run id (textarea)",
        ),
        merge: is.union([
          is.literal(false).describe("Disable merge"),
          is.literal("commit").describe("Merge pull request with a merge commit"),
          is.literal("squash").describe("Merge pull request with a squash commit"),
          is.literal("rebase").describe("Merge pull request with a rebase commit"),
        ]).describe("Merge pull request").default(false),
        checks: is.object({
          attempts: is.number().min(0).default(30).describe("Number of retries"),
          delay: is.number().min(0).default(3).describe("Delay (in seconds) before trying to check state again"),
        }).default(() => ({})).describe("Meargeability state check"),
        from: is.string().default("metrics").describe("Branch where pull request will be opened"),
        to: is.string().default("main").describe("Branch where pull request changes should be merged to"),
      }).describe("Open pull request on repository"),
    ]).default(false),
    filepath: is.string().default("metrics.*").describe("Target filename (use `*` to automatically match detected filetype extension)"),
  })

  /** Does this processor needs to perform requests ? */
  protected requesting = true

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { mime, base64, content } = result
    const { commit, filepath, repository, pullrequest } = await parse(this.inputs, this.context.args)
    let file = filepath
    if (mime) {
      const ext = extension(mime)!
      this.log.trace(`using extension: ${ext} for ${mime}`)
      file = file.replaceAll("*", ext)
    }
    const { owner, name: repo } = parseHandle(repository, { entity: "repository" }) as { owner: string; name: string }
    const { repository: { id } } = await this.requests.graphql("repository", { owner, repo })
    this.log.debug(`repository id for ${repository}: ${id}`)
    if (commit) {
      await this.commit({ commit, base64, content, repository, owner, repo, file, id })
    }
    if (pullrequest) {
      await this.pullrequest({ pullrequest, repository, owner, repo, file, id })
    }
  }

  /** Manage commits */
  private async commit(
    { commit, content, base64, repository, owner, repo, file, id }: {
      commit: Exclude<is.infer<typeof _.prototype.inputs>["commit"], false>
      base64: boolean
      content: string
      repository: string
      owner: string
      repo: string
      file: string
      id: string
    },
  ) {
    // Fetch base head from either base branch or empty tree
    const { head: base } = await this.peak({ owner, repo, branch: commit.base, file })
    if (!base) {
      throws(`Base branch ${repository}@${commit.base} does not exist (it must be created manually prior execution)`)
    }
    this.log.trace(`${repository}@${commit.base} at: ${base}`)
    // Fetch last commit from target branch
    let { head, revision } = await this.peak({ owner, repo, branch: commit.to, file })
    if (!head) {
      this.log.debug(`creating branch ${commit.to}: at ${base}`)
      const { mutation: { ref } } = await this.requests.graphql("createref", { branch: `refs/heads/${commit.to}`, base, repository: id })
      this.log.trace(`created ${ref.name}`)
      head = base
    }

    // Compute object hash
    this.log.debug(`committing ${file} to ${commit.to}`)
    const header = new TextEncoder().encode(`blob ${content.length}\0`)
    const blob = base64 ? decodeBase64(content) : new TextEncoder().encode(content)
    const object = new Uint8Array(header.length + blob.length)
    object.set(header)
    object.set(blob, header.length)
    const oid = [...new Uint8Array(await crypto.subtle.digest("SHA-1", object))].map((byte) => byte.toString(16).padStart(2, "0")).join("")
    this.log.trace(`${file}~HEAD: ${oid}`)
    this.log.trace(`${file}@${commit.to}: ${revision?.oid ?? "(not created yet)"}`)

    // Update file on changes (or if it does not exist yet)
    if ((!revision) || (oid !== revision.oid)) {
      this.log.debug(`uploading new revision of ${file}@${commit.to}`)
      const contents = base64 ? content : encodeBase64(content)
      const { mutation: { commit: { oid } } } = await this.requests.graphql("commit", {
        repository,
        branch: commit.to,
        message: this.format(commit.message, { file }),
        path: file,
        contents,
        head,
      })
      this.log.trace(`${file}@${commit.to}: now at ${oid}`)
    }
  }

  /** Manage pull requests */
  private async pullrequest(
    { pullrequest, repository, owner, repo, file, id }: {
      pullrequest: Exclude<is.infer<typeof _.prototype.inputs>["pullrequest"], false>
      repository: string
      owner: string
      repo: string
      file: string
      id: string
    },
  ) {
    // Create pull request
    const pr = { number: NaN, id: null }
    this.log.debug(`creating pull request from ${pullrequest.from} to ${pullrequest.to}`)
    try {
      for (const branch of [pullrequest.from, pullrequest.to]) {
        if (!(await this.peak({ owner, repo, branch, file })).branch) {
          this.log.warn(`branch ${branch} does not seem to exist yet, pull request creation may fail`)
        }
      }
      const { mutation: { pullrequest: opened } } = await this.requests.graphql("pullrequest", {
        title: this.format(pullrequest.title, { file }),
        message: this.format(pullrequest.message, { file }),
        head: pullrequest.from,
        base: pullrequest.to,
        repository: id,
      })
      Object.assign(pr, opened)
      this.log.debug(`opened #${pr.number}`)
    } catch (error) {
      switch (true) {
        case (/no commits between/i.test(error)) && (!/(must be a branch)|(sha can't be blank)/i.test(error)):
          this.log.debug(`no changes between ${pullrequest.from} and ${pullrequest.to}`)
          break
        case /a pull request already exists/i.test(error):
          this.log.debug(`pull request between ${pullrequest.from} and ${pullrequest.to} already exists`)
          break
        default:
          throw error
      }
    }

    // Merge pull request
    if (pullrequest.merge) {
      // Fetch pull request id if needed
      if (!pr.id) {
        const search = `type:pr state:open repo:${repository} head:${pullrequest.from} base:${pullrequest.to}`
        this.log.debug(`searching pull request using query: ${search}`)
        const { search: { pullrequests } } = await this.requests.graphql("pullrequest.number", { search })
        if (pullrequests.length < 1) {
          throws(`Could not find back pull request, cannot merge (used query: ${search})`)
        }
        if (pullrequests.length > 1) {
          throws(`Found more than one matching pull request, refusing to merge (used query: ${search})`)
        }
        const [opened] = pullrequests
        Object.assign(pr, opened)
        this.log.trace(`found pull request #${pr.number}: ${opened.title}`)
        this.log.trace(`pull request #${pr.number} id: ${pr.id}`)
      }
      this.log.debug(`merging pull request #${pr.number} with merge ${pullrequest.merge}`)

      // Merge pull request once state is mergeable
      mergeable: for (let i = 0; i < pullrequest.checks.attempts; ++i) {
        const { repository: { pullrequest: { mergeable: state } } } = await this.requests.graphql("pullrequest.mergeable", { owner, repo, pr: pr.number })
        switch (state) {
          // deno-lint-ignore no-fallthrough
          case "CONFLICTING":
            throws(`Pull request #${pr.number} state is ${state}, cannot merge`)
          case "MERGEABLE":
            break mergeable
          default:
            this.log.trace(`Pull request #${pr.number} state is ${state}, waiting for mergeable state`)
            if (pullrequest.checks.delay) {
              this.log.trace(`Pull request #${pr.number}: retrying in ${pullrequest.checks.delay}s...`)
              await delay(pullrequest.checks.delay * 1000)
            }
            continue
        }
      }
      this.log.debug(`Pull request #${pr.number} state is MERGEABLE, merging`)
      await this.requests.graphql("pullrequest.merge", { pr: pr.id, method: { commit: "MERGE", rebase: "REBASE", squash: "SQUASH" }[pullrequest.merge] })
    }
  }

  /** Format commit message */
  private format(template: string, { file }: { file: string }) {
    return template
      .replaceAll("${file}", file)
      .replaceAll("${run}", `${github.context.runId || ""}`)
  }

  /** Peak head of repository */
  private async peak({ owner, repo, branch, file }: { owner: string; repo: string; branch: string; file: string }) {
    const { repository: { branch: ref, revision } } = await this.requests.graphql("head", { owner, repo, branch, file: `${branch}:${file}` })
    const head = ref?.history.commits[0].oid
    this.log.debug(`${file}@${branch}: ${head ? `at ${head}` : "(not created yet)"}`)
    return { branch: ref, revision, head }
  }
}
