//Setup
export default async function({login, q, imports, data, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.leetcode) || (!imports.metadata.plugins.leetcode.enabled(enabled, {extras})))
      return null

    //Load inputs
    let {user, sections, "limit.skills": _limit_skills, "ignored.skills": _ignored_skills, "limit.recent": _limit_recent} = imports.metadata.plugins.leetcode.inputs({data, account, q})
    const result = {user, sections, languages: [], skills: [], problems: {}, recent: []}

    //Languages stats
    {
      console.debug(`metrics/compute/${login}/plugins > leetcode > querying api (languages statistics)`)
      const {data: {data: {matchedUser: {languageProblemCount: languages}}}} = await imports.axios.post("https://leetcode.com/graphql", {variables: {username: user}, query: queries.leetcode.languages()})
      result.languages = languages.map(({languageName: language, problemsSolved: solved}) => ({language, solved}))
    }

    //Skills stats
    {
      console.debug(`metrics/compute/${login}/plugins > leetcode > querying api (skills statistics)`)
      const {data: {data: {matchedUser: {tagProblemCounts: skills}}}} = await imports.axios.post("https://leetcode.com/graphql", {variables: {username: user}, query: queries.leetcode.skills()})
      for (const category in skills)
        result.skills.push(...skills[category].map(({tagName: name, problemsSolved: solved}) => ({name, solved, category})))
      result.skills.sort((a, b) => b.solved - a.solved)
      result.skills = result.skills.filter(({name, category}) => (imports.filters.text(name, _ignored_skills)) && (imports.filters.text(category, _ignored_skills)))
      result.skills = result.skills.slice(0, _limit_skills || Infinity)
    }

    //Problems
    {
      console.debug(`metrics/compute/${login}/plugins > leetcode > querying api (problems statistics)`)
      const {data: {data: {allQuestionsCount: all, matchedUser: {submitStatsGlobal: {acSubmissionNum: submissions}}}}} = await imports.axios.post("https://leetcode.com/graphql", {variables: {username: user}, query: queries.leetcode.problems()})
      for (const {difficulty, count} of all)
        result.problems[difficulty] = {count, solved: 0}
      for (const {difficulty, count: solved} of submissions)
        result.problems[difficulty].solved = solved
    }

    //Recent submissions
    {
      console.debug(`metrics/compute/${login}/plugins > leetcode > querying api (recent submissions statistics)`)
      const {data: {data: {recentAcSubmissionList: submissions}}} = await imports.axios.post("https://leetcode.com/graphql", {variables: {username: user, limit: _limit_recent}, query: queries.leetcode.recent()})
      result.recent = submissions.map(({title, timestamp}) => ({title, date: new Date(timestamp * 1000)}))
    }

    //Results
    return result
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
