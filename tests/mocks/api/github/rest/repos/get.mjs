/**Mocked data */
export default async function({faker}, target, that, [{owner, repo}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.repos.get")
  return ({
    status: 200,
    url: `https://api.github.com/repos/${owner}/${repo}`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: {
      id: faker.datatype.number(100000),
      name: repo,
      full_name: `${owner}/${repo}`,
      private: false,
      owner: {
        login: owner,
        id: faker.datatype.number(100000),
      },
      description: faker.lorem.sentences(),
      created_at: faker.date.past(),
      license: {
        key: "mit",
        name: "MIT License",
      },
      default_branch: "main",
    },
  })
}
