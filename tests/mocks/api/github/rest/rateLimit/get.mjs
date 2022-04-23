/**Mocked data */
export default async function({faker}, target, that, args) {
  return ({
    status: 200,
    url: "https://api.github.com/rate_limit",
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: {
      resources: {
        core: {limit: 5000, used: 0, remaining: 5000, reset: 0},
        search: {limit: 30, used: 0, remaining: 30, reset: 0},
        graphql: {limit: 5000, used: 0, remaining: 5000, reset: 0},
        integration_manifest: {limit: 5000, used: 0, remaining: 5000, reset: 0},
        source_import: {limit: 100, used: 0, remaining: 100, reset: 0},
        code_scanning_upload: {limit: 500, used: 0, remaining: 500, reset: 0},
      },
      rate: {limit: 5000, used: 0, remaining: "MOCKED", reset: 0},
    },
  })
}
