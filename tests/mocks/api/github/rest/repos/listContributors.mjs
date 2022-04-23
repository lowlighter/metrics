/**Mocked data */
export default async function({faker}, target, that, [{owner, repo}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.repos.listContributors")
  return ({
    status: 200,
    url: `https://api.github.com/repos/${owner}/${repo}/contributors`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: new Array(40 + faker.datatype.number(60)).fill(null).map(() => ({
      login: faker.internet.userName(),
      avatar_url: null,
      contributions: faker.datatype.number(1000),
    })),
  })
}
