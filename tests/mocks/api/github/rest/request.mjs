/**Mocked data */
export default async function({faker}, target, that, args) {
  //Arguments
  const [url] = args
  //Head request
  if (/^HEAD .$/.test(url)) {
    console.debug("metrics/compute/mocks > mocking rest api result > rest.request HEAD")
    return ({
      status: 200,
      url: "https://api.github.com/",
      headers: {
        server: "GitHub.com",
        status: "200 OK",
        "x-oauth-scopes": "repo",
      },
      data: undefined,
    })
  }
  //Commit content
  if (/^https:..api.github.com.repos.lowlighter.metrics.commits.MOCKED_SHA/.test(url)) {
    console.debug(`metrics/compute/mocks > mocking rest api result > rest.request ${url}`)
    return ({
      status: 200,
      url: "https://api.github.com/repos/lowlighter/metrics/commits/MOCKED_SHA",
      data: {
        sha: "MOCKED_SHA",
        commit: {
          author: {
            name: faker.internet.userName(),
            email: faker.internet.email(),
            date: `${faker.date.recent(7)}`,
          },
          committer: {
            name: faker.internet.userName(),
            email: faker.internet.email(),
            date: `${faker.date.recent(7)}`,
          },
          url: "https://api.github.com/repos/lowlighter/metrics/commits/MOCKED_SHA",
        },
        author: {
          login: faker.internet.userName(),
          id: faker.datatype.number(100000000),
        },
        committer: {
          login: faker.internet.userName(),
          id: faker.datatype.number(100000000),
        },
        files: [
          {
            sha: "MOCKED_SHA",
            filename: faker.system.fileName(),
            patch: '@@ -0,0 +1,5 @@\n+//Imports\n+  import app from "./src/app.mjs"\n+\n+//Start app\n+  await app()\n\\ No newline at end of file',
          },
        ],
      },
    })
  }

  return target(...args)
}
