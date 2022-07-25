/**Mocked data */
export default async function({faker}, target, that, [{owner, repo}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.repos.getContributorsStats")
  return ({
    status: 200,
    url: `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: [
      {
        total: faker.datatype.number(10000),
        weeks: [
          {w: faker.date.recent(), a: faker.datatype.number(10000), d: faker.datatype.number(10000), c: faker.datatype.number(10000)},
          {w: faker.date.recent(), a: faker.datatype.number(10000), d: faker.datatype.number(10000), c: faker.datatype.number(10000)},
          {w: faker.date.recent(), a: faker.datatype.number(10000), d: faker.datatype.number(10000), c: faker.datatype.number(10000)},
          {w: faker.date.recent(), a: faker.datatype.number(10000), d: faker.datatype.number(10000), c: faker.datatype.number(10000)},
        ].sort((a, b) => new Date(a.w) - new Date(b.w)),
        author: {
          login: owner,
        },
      },
    ],
  })
}
