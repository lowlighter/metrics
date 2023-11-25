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
    const year = `${new Date().getFullYear()}`
    return {
      status,
      data: [
        {
          weeks: [
            {
              w: new Date(year).getTime() / 1000,
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
              w: new Date(year).getTime() / 1000,
              a: faker.number.int({ min: 0, max: 10000 }),
              d: faker.number.int({ min: 0, max: 10000 }),
              c: faker.number.int({ min: 0, max: 10000 }),
            },
            {
              w: (new Date(year).getTime() - 7 * 24 * 60 * 60 * 1000) / 1000,
              a: faker.number.int({ min: 0, max: 10000 }),
              d: faker.number.int({ min: 0, max: 10000 }),
              c: faker.number.int({ min: 0, max: 10000 }),
            },
            {
              w: new Date(`${+year - 1}`).getTime() / 1000,
              a: faker.number.int({ min: 0, max: 10000 }),
              d: faker.number.int({ min: 0, max: 10000 }),
              c: faker.number.int({ min: 0, max: 10000 }),
            },
          ],
          author: {
            login: "octosquid",
            avartar_url: faker.image.avatarGitHub(),
          },
        },
        {
          weeks: [
            {
              w: NaN,
              a: faker.number.int({ min: 0, max: 10000 }),
              d: faker.number.int({ min: 0, max: 10000 }),
              c: faker.number.int({ min: 0, max: 10000 }),
            },
          ],
          author: null,
        },
      ],
    }
  }),
}
