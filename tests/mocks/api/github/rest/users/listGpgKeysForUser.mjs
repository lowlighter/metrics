/**Mocked data */
export default async function({faker}, target, that, [{username}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.users.listGpgKeysForUser")
  return ({
    status: 200,
    url: `https://api.github.com/users/${username}/`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: [
      {
        key_id: faker.datatype.hexaDecimal(16),
        raw_key: "-----BEGIN PGP PUBLIC KEY BLOCK-----\n(dummy content)\n-----END PGP PUBLIC KEY BLOCK-----",
        emails: [
          {
            email: faker.internet.email(),
            verified: true,
          },
        ],
      },
    ],
  })
}
