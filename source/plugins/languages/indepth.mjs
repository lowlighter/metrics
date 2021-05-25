/**Indepth analyzer */
export default async function({login, data, imports}, {skipped, ignored}) {
  //Check prerequisites
  if (!await imports.which("github-linguist"))
    throw new Error("Feature requires github-linguist")

  //Compute repositories stats
  const results = {total:0, stats:{}}
  for (const repository of data.user.repositories.nodes) {
    const repo = `${repository.owner.login}/${repository.name}`
    console.debug(`metrics/compute/${login}/plugins > languages > indepth > checking ${repo}`)
    //Skip repository if asked
    if ((skipped.includes(repository.name.toLocaleLowerCase())) || (skipped.includes(`${repository.owner.login}/${repository.name}`.toLocaleLowerCase()))) {
      console.debug(`metrics/compute/${login}/plugins > languages > skipped repository ${repository.owner.login}/${repository.name}`)
      continue
    }
    //Analyze
    try {
      await analyze(arguments[0], {repo, results})
    }
    catch {
      console.debug(`metrics/compute/${login}/plugins > languages > indepth > an error occured while processing ${repo}, skipping...`)
    }
  }

  //Ignore languages if asked
  Object.assign(results.stats, Object.fromEntries(Object.entries(results.stats).filter(([lang]) => !ignored.includes(lang.toLocaleLowerCase()))))
  return results
}

/**Clone and analyze a single repository */
async function analyze({login, data, imports}, {repo, results}) {
  //Git clone into a temporary directory
  const path = imports.paths.join(imports.os.tmpdir(), `${data.user.databaseId}-${repo.replace(/[^\w]/g, "_")}`)
  console.debug(`metrics/compute/${login}/plugins > languages > indepth > cloning ${repo} to temp dir ${path}`)
  await imports.fs.rmdir(path, {recursive:true})
  await imports.fs.mkdir(path, {recursive:true})
  const git = await imports.git(path)
  await git.clone(`https://github.com/${repo}`, ".").status()

  //Spawn linguist process and map files to languages
  console.debug(`metrics/compute/${login}/plugins > languages > indepth > running linguist`)
  const files = {}
  {
    const stdout = await imports.run("github-linguist --breakdown", {cwd:path}, {log:false})
    let lang = null
    for (const line of stdout.split("\n").map(line => line.trim())) {
      //Ignore empty lines
      if (!line.length)
        continue
      //Language marker
      if (/^(?<lang>[\s\S]+):\s*$/.test(line)) {
        lang = line.match(/^(?<lang>[\s\S]+):\s*$/)?.groups?.lang ?? null
        continue
      }
      //Store language
      if (lang) {
        files[line] = {lang}
        continue
      }
    }
  }

  //Processing diff
  const per_page = 10
  console.debug(`metrics/compute/${login}/plugins > languages > indepth > checking git log`)
  for (let page = 0; ; page++) {
    try {
      const stdout = await imports.run(`git log --author="${login}" --format="" --patch --max-count=${per_page} --skip=${page*per_page}`, {cwd:path}, {log:false})
      let file = null, lang = null
      if (!stdout.trim().length) {
        console.debug(`metrics/compute/${login}/plugins > languages > indepth > no more commits`)
        break
      }
      console.debug(`metrics/compute/${login}/plugins > languages > indepth > processing commits ${page*per_page} from ${(page+1)*per_page}`)
      for (const line of stdout.split("\n").map(line => line.trim())) {
        //Ignore empty lines or unneeded lines
        if ((!/^[+]/.test(line))||(!line.length))
          continue
        //File marker
        if (/^[+]{3}\sb[/](?<file>[\s\S]+)$/.test(line)) {
          file = line.match(/^[+]{3}\sb[/](?<file>[\s\S]+)$/)?.groups?.file ?? null
          lang = files[file]?.lang ?? null
          continue
        }
        //Ignore unkonwn languages
        if (!lang)
          continue
        //Added line marker
        if (/^[+]\s(?<line>[\s\S]+)$/.test(line)) {
          const size = Buffer.byteLength(line.match(/^[+]\s(?<line>[\s\S]+)$/)?.groups?.line ?? "", "utf-8")
          results.stats[lang] = (results.stats[lang] ?? 0) + size
          results.total += size
        }
      }
    }
    catch {
      console.debug(`metrics/compute/${login}/plugins > languages > indepth > an error occured on page ${page}, skipping...`)
    }
  }

  //Cleaning
  console.debug(`metrics/compute/${login}/plugins > languages > indepth > cleaning temp dir ${path}`)
  await imports.fs.rmdir(path, {recursive:true})
}