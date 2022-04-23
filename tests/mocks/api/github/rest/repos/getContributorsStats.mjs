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
          {w: 1, a: faker.datatype.number(10000), d: faker.datatype.number(10000), c: faker.datatype.number(10000)},
          {w: 2, a: faker.datatype.number(10000), d: faker.datatype.number(10000), c: faker.datatype.number(10000)},
          {w: 3, a: faker.datatype.number(10000), d: faker.datatype.number(10000), c: faker.datatype.number(10000)},
          {w: 4, a: faker.datatype.number(10000), d: faker.datatype.number(10000), c: faker.datatype.number(10000)},
        ],
        author: {
          login: owner,
        },
      },
    ],
  })
}
