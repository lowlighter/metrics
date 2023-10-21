import { faker, is, log, mock, Status } from "@engine/utils/testing.ts"

let available = false
let timeout = NaN

export default {
  "/repos/{owner}/{repo}/stats/contributors": mock({ owner: is.string(), repo: is.string() }, ({ owner, repo }) => {
    let status = Status.OK
    if (repo === "empty") {
      status = Status.NoContent
    }
    if (repo === "retry") {
      status = available ? Status.OK : Status.Accepted
      available = true
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        log.io(`${owner}/${repo}: state reset`)
        available = false
      }, 100)
    }
    return {
      status,
      data: [
        {
          weeks: [
            {
              w: new Date("2023").getTime() / 1000,
              a: faker.number.int({ min: 0, max: 10000 }),
              d: faker.number.int({ min: 0, max: 10000 }),
              c: faker.number.int({ min: 0, max: 10000 }),
            },
          ],
          author: {
            login: "octocat",
            avartar_url: faker.image.avatarGitHub(),
          },
        },
        {
          weeks: [
            {
              w: new Date("2022").getTime() / 1000,
              a: faker.number.int({ min: 0, max: 10000 }),
              d: faker.number.int({ min: 0, max: 10000 }),
              c: faker.number.int({ min: 0, max: 10000 }),
            },
          ],
          author: {
            login: "octodog",
            avartar_url: faker.image.avatarGitHub(),
          },
        },
      ],
    }
  }),
}
