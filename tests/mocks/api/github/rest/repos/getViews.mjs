/**Mocked data */
export default async function({faker}, target, that, [{owner, repo}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.repos.getViews")
  const count = faker.number.int(10000) * 2
  const uniques = faker.number.int(count) * 2
  return ({
    status: 200,
    url: `https://api.github.com/repos/${owner}/${repo}/traffic/views`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: {
      count,
      uniques,
      views: [
        {timestamp: `${faker.date.recent()}`, count: count / 2, uniques: uniques / 2},
        {timestamp: `${faker.date.recent()}`, count: count / 2, uniques: uniques / 2},
      ],
    },
  })
}
