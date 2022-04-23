//Imports
import linguist from "linguist-js"

/**Indepth analyzer */
export async function indepth({login, data, imports, repositories, gpg}, {skipped, categories, timeout}) {
  return new Promise(async solve => {
    //Results
    const results = {partial: false, total: 0, lines: {}, stats: {}, colors: {}, commits: 0, files: 0, missed: {lines: 0, bytes: 0, commits: 0}, verified: {signature: 0}}

    //Timeout
    if (Number.isFinite(timeout)) {
      console.debug(`metrics/compute/${login}/plugins > languages > timeout set to ${timeout}m`)
      setTimeout(() => {
        results.partial = true
        console.debug(`metrics/compute/${login}/plugins > languages > reached maximum execution time of ${timeout}m for analysis`)
        solve(results)
      }, timeout * 60 * 1000)
    }

    //GPG keys imports
    for (const {id, pub} of gpg) {
      const path = imports.paths.join(imports.os.tmpdir(), `${data.user.databaseId}.${id}.gpg`)
      console.debug(`metrics/compute/${login}/plugins > languages > saving gpg ${id} to ${path}`)
      try {
        await imports.fs.writeFile(path, pub)
        if (process.env.GITHUB_ACTIONS) {
          console.debug(`metrics/compute/${login}/plugins > languages > importing gpg ${id}`)
          await imports.run(`gpg --import ${path}`)
        }
        else {
          console.debug(`metrics/compute/${login}/plugins > languages > skipping import of gpg ${id}`)
        }
      }
      catch (error) {
        console.debug(`metrics/compute/${login}/plugins > languages > indepth > an error occured while importing gpg ${id}, skipping...`)
      }
      finally {
        //Cleaning
        console.debug(`metrics/compute/${login}/plugins > languages > indepth > cleaning ${path}`)
        await imports.fs.rm(path, {recursive: true, force: true}).catch(error => console.debug(`metrics/compute/${login}/plugins > languages > indepth > failed to clean ${path} (${error})`))
      }
    }

    //Compute repositories stats from fetched repositories
    for (const repository of repositories) {
      //Early break
      if (results.partial)
        break

      //Skip repository if asked
      if ((skipped.includes(repository.name.toLocaleLowerCase())) || (skipped.includes(`${repository.owner.login}/${repository.name}`.toLocaleLowerCase()))) {
        console.debug(`metrics/compute/${login}/plugins > languages > skipped repository ${repository.owner.login}/${repository.name}`)
        continue
      }

      //Repository handle
      const repo = `${repository.owner.login}/${repository.name}`
      console.debug(`metrics/compute/${login}/plugins > languages > indepth > checking ${repo}`)

      //Temporary directory
      const path = imports.paths.join(imports.os.tmpdir(), `${data.user.databaseId}-${repo.replace(/[^\w]/g, "_")}`)
      console.debug(`metrics/compute/${login}/plugins > languages > indepth > cloning ${repo} to temp dir ${path}`)

      //Process
      try {
        //Git clone into temporary directory
        await imports.fs.rm(path, {recursive: true, force: true})
        await imports.fs.mkdir(path, {recursive: true})
        const git = await imports.git(path)
        await git.clone(`https://github.com/${repo}`, ".").status()

        //Analyze repository
        await analyze(arguments[0], {results, path, categories})
      }
      catch (error) {
        console.debug(`metrics/compute/${login}/plugins > languages > indepth > an error occured while processing ${repo}, skipping...`)
      }
      finally {
        //Cleaning
        console.debug(`metrics/compute/${login}/plugins > languages > indepth > cleaning temp dir ${path}`)
        await imports.fs.rm(path, {recursive: true, force: true}).catch(error => console.debug(`metrics/compute/${login}/plugins > languages > indepth > failed to clean ${path} (${error})`))
      }
    }
    solve(results)
  })
}

/**Recent languages activity */
export async function recent({login, data, imports, rest, account}, {skipped = [], categories, days = 0, load = 0, tempdir = "recent", timeout}) {
  return new Promise(async solve => {
    //Results
    const results = {partial: false, total: 0, lines: {}, stats: {}, colors: {}, commits: 0, files: 0, missed: {lines: 0, bytes: 0, commits: 0}, days}

    //Timeout
    if (Number.isFinite(timeout)) {
      console.debug(`metrics/compute/${login}/plugins > languages > timeout set to ${timeout}m`)
      setTimeout(() => {
        results.partial = true
        console.debug(`metrics/compute/${login}/plugins > languages > reached maximum execution time of ${timeout}m for analysis`)
        solve(results)
        return
      }, timeout * 60 * 1000)
    }

    //Get user recent activity
    console.debug(`metrics/compute/${login}/plugins > languages > querying api`)
    const commits = [], pages = Math.ceil(load / 100)
    try {
      for (let page = 1; page <= pages; page++) {
        console.debug(`metrics/compute/${login}/plugins > languages > loading page ${page}`)
        commits.push(
          ...(await rest.activity.listEventsForAuthenticatedUser({username: login, per_page: 100, page})).data
            .filter(({type}) => type === "PushEvent")
            .filter(({actor}) => account === "organization" ? true : actor.login?.toLocaleLowerCase() === login.toLocaleLowerCase())
            .filter(({repo: {name: repo}}) => (!skipped.includes(repo.toLocaleLowerCase())) && (!skipped.includes(repo.toLocaleLowerCase().split("/").pop())))
            .filter(({created_at}) => new Date(created_at) > new Date(Date.now() - days * 24 * 60 * 60 * 1000)),
        )
      }
    }
    catch {
      console.debug(`metrics/compute/${login}/plugins > languages > no more page to load`)
    }
    console.debug(`metrics/compute/${login}/plugins > languages > ${commits.length} commits loaded`)
    results.latest = Math.round((new Date().getTime() - new Date(commits.slice(-1).shift()?.created_at).getTime()) / (1000 * 60 * 60 * 24))

    //Retrieve edited files and filter edited lines (those starting with +/-) from patches
    console.debug(`metrics/compute/${login}/plugins > languages > loading patches`)
    console.debug(`metrics/compute/${login}/plugins > languages > commits authoring set to ${JSON.stringify(data.shared["commits.authoring"])}`)
    let patches = [
      ...await Promise.allSettled(
        commits
          .flatMap(({payload}) => payload.commits)
          .filter(({author}) => data.shared["commits.authoring"].filter(authoring => author?.login?.toLocaleLowerCase().includes(authoring) || author?.email?.toLocaleLowerCase().includes(authoring) || author?.name?.toLocaleLowerCase().includes(authoring)).length)
          .map(commit => commit.url)
          .map(async commit => (await rest.request(commit)).data),
      ),
    ]
      .filter(({status}) => status === "fulfilled")
      .map(({value}) => value)
      .filter(({parents}) => parents.length <= 1)
      .map(({files}) => files)
      .flatMap(files => files.map(file => ({name: imports.paths.basename(file.filename), directory: imports.paths.dirname(file.filename), patch: file.patch ?? "", repo: file.raw_url?.match(/(?<=^https:..github.com\/)(?<repo>.*)(?=\/raw)/)?.groups.repo ?? "_"})))
      .map(({name, directory, patch, repo}) => ({name, directory: `${repo.replace(/[/]/g, "@")}/${directory}`, patch: patch.split("\n").filter(line => /^[+]/.test(line)).map(line => line.substring(1)).join("\n")}))

    //Temporary directory
    const path = imports.paths.join(imports.os.tmpdir(), `${data.user.databaseId}-${tempdir}`)
    console.debug(`metrics/compute/${login}/plugins > languages > creating temp dir ${path} with ${patches.length} files`)

    //Process
    try {
      //Save patches in temporary directory matching respective repository and filename
      await imports.fs.rm(path, {recursive: true, force: true})
      await imports.fs.mkdir(path, {recursive: true})
      await Promise.all(patches.map(async ({name, directory, patch}) => {
        await imports.fs.mkdir(imports.paths.join(path, directory), {recursive: true})
        await imports.fs.writeFile(imports.paths.join(path, directory, name), patch)
      }))

      //Process temporary repositories
      for (const directory of await imports.fs.readdir(path)) {
        //Pull gitattributes if possible
        for (const branch of ["main", "master"]) {
          const repo = directory.replace("@", "/")
          try {
            await imports.fs.writeFile(imports.paths.join(path, directory, ".gitattributes"), await imports.fetch(`https://raw.githubusercontent.com/${repo}/${branch}/.gitattributes`).then(response => response.text()).catch(() => ""))
            console.debug(`metrics/compute/${login}/plugins > languages > successfully fetched .gitattributes for ${repo}`)
            break
          }
          catch {
            console.debug(`metrics/compute/${login}/plugins > languages > cannot load .gitattributes on branch ${branch} for ${repo}`)
          }
        }

        //Create temporary git repository
        console.debug(`metrics/compute/${login}/plugins > languages > creating temp git repository for ${directory}`)
        const git = await imports.git(imports.paths.join(path, directory))
        await git.init().add(".").addConfig("user.name", data.shared["commits.authoring"]?.[0] ?? login).addConfig("user.email", "<>").commit("linguist").status()

        //Analyze repository
        await analyze(arguments[0], {results, path: imports.paths.join(path, directory), categories})

        //Since we reproduce a "partial repository" with a single commit, use number of commits retrieved instead
        results.commits = commits.length
      }
    }
    catch {
      console.debug(`metrics/compute/${login}/plugins > languages > an error occured while processing recently used languages`)
    }
    finally {
      //Cleaning
      console.debug(`metrics/compute/${login}/plugins > languages > cleaning temp dir ${path}`)
      await imports.fs.rm(path, {recursive: true, force: true}).catch(error => console.debug(`metrics/compute/${login}/plugins > languages > indepth > failed to clean ${path} (${error})`))
    }
    solve(results)
  })
}

/**Analyze a single repository */
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
            console.debug(`metrics/compute/${login}/plugins > languages > indepth > an error occured while processing line (${error.message}), skipping...`)
          }
        },
      })
      if (empty) {
        console.debug(`metrics/compute/${login}/plugins > languages > indepth > no more commits`)
        break
      }
    }
    catch {
      console.debug(`metrics/compute/${login}/plugins > languages > indepth > an error occured on page ${page}, skipping...`)
      results.missed.commits += per_page
    }
  }
  await Promise.allSettled(pending)
  results.files += edited.size
}

//import.meta.main
if (/languages.analyzers.mjs$/.test(process.argv[1])) {
  ;(async function() {
    //Parse inputs
    const [_authoring, path] = process.argv.slice(2)
    if ((!_authoring) || (!path)) {
      console.log("Usage is:\n  npm run indepth -- <commits authoring> <repository local path>\n\n")
      process.exit(1)
    }
    const {default: setup} = await import("../../app/metrics/setup.mjs")
    const {conf: {metadata}} = await setup({log: false})
    const {"commits.authoring": authoring} = await metadata.plugins.base.inputs({q: {"commits.authoring": _authoring}, account: "bypass"})
    const data = {shared: {"commits.authoring": authoring}}

    //Prepare call
    const imports = await import("../../app/metrics/utils.mjs")
    const results = {total: 0, lines: {}, colors: {}, stats: {}, missed: {lines: 0, bytes: 0, commits: 0}}
    console.debug = log => /exited with code null/.test(log) ? console.error(log.replace(/^.*--max-count=(?<step>\d+) --skip=(?<start>\d+).*$/, (_, step, start) => `error: skipped commits ${start} from ${Number(start) + Number(step)}`)) : null

    //Analyze repository
    console.log(`commits authoring | ${authoring}\nrepository path   | ${path}\n`)
    await analyze({login: "cli", data, imports}, {results, path})
    console.log(results)
  })()
}
