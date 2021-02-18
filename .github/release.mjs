//Imports
  import github from "@actions/github"
  import paths from "path"
  import url from "url"
  import sgit from "simple-git"

//Git setup
  const __metrics = paths.join(paths.dirname(url.fileURLToPath(import.meta.url)), "..")
  const git = sgit(__metrics)

//Setup octokit
  const token = process.env.GITHUB_TOKEN
  const rest = github.getOctokit(token)

//Environment
  const maintainer = "lowlighter"
  const repository = process.env.GITHUB_REPOSITORY.match(/^(?<owner>[\s\S]+)[/](?<name>[\s\S]+)$/)?.groups ?? null
  const version = process.env.GITHUB_COMMIT_MESSAGE.match(/(?<version>v\d+[.]\d+)/)?.groups?.version ?? null

//Check arguments
  if ((!repository)||(!repository.name)||(!repository.owner))
    throw new Error(`Could not parse repository "${process.env.GITHUB_REPOSITORY}"`)
  console.log(`Repository: ${repository.owner}/${repository.name}`)
  if (!version)
    throw new Error(`Could not parse version from "${process.env.GITHUB_COMMIT_MESSAGE}"`)
  console.log(`Version: ${version}`)

//Load related issue
  const {data:{items:issues}} = await rest.search.issuesAndPullRequests({
    q:`repo:${repository.owner}/${repository.name} is:issue is:open author:${maintainer} assignee:${maintainer} Release ${version} in:title`
  })

//Ensure that there is exactly one issue matching
  if (issues.length < 1)
    throw new Error(`No matching issues found`)
  if (issues.length > 1)
    throw new Error(`Multiple issues found (${issues.length} matching)`)
  const [patchnote] = issues
  console.log(`Using issue#${patchnote.number}: ${patchnote.title}`)

//Check whether release already exists
  try {
    const {data:{id}} = await rest.repos.getReleaseByTag({owner:repository.owner, repo:repository.name, tag:version})
    console.log(`Release ${version} already exists (#${id}), will replace it`)
    await rest.repos.deleteRelease({owner:repository.owner, repo:repository.name, release_id:id})
    console.log(`Deleting tag ${version}`)
    await git.push(["--delete", "origin", version])
    await new Promise(solve => setTimeout(solve, 15*1000))
  }
  catch {
    console.log(`Release ${version} does not exists yet, will create it`)
  }

//Publish release
  await rest.repos.createRelease({owner:repository.owner, repo:repository.name, tag_name:version, name:`Version ${version}`, body:patchnote.body})
  console.log(`Successfully published`)

//Close patchnote issue
  await rest.issues.update({owner:repository.owner, repo:repository.name, issue_number:patchnote.number, state:"closed"})
  console.log(`Closed #${patchnote.number}`)
