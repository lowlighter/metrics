/**Mocked data */
export default async function({faker}, target, that, [{username}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.repos.getByUsername")
  return ({
    status: 200,
    url: `https://api.github.com/users/${username}/`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: {
      login: faker.internet.userName(),
      avatar_url: null,
      contributions: faker.datatype.number(1000),
    },
  })
}
