/**Mocked data */
export default async function({faker}, target, that, [{page, per_page, owner, repo}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.repos.listCommits")
  return ({
    status: 200,
    url: `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${per_page}&page=${page}`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: page < 2
      ? new Array(per_page).fill(null).map(() => ({
        sha: "MOCKED_SHA",
        get author() {
          return this.commit.author
        },
        commit: {
          message: faker.lorem.sentence(),
          author: {
            name: owner,
            login: faker.internet.userName(),
            avatar_url: null,
            date: `${faker.date.recent(14)}`,
          },
          committer: {
            name: owner,
            login: faker.internet.userName(),
            avatar_url: null,
            date: `${faker.date.recent(14)}`,
          },
        },
      }))
      : [],
  })
}
