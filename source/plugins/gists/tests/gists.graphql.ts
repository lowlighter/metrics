import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ login: is.string(), privacy: is.enum(["PUBLIC", "ALL"]) }, ({ privacy }) => {
  const count = { PUBLIC: 10, ALL: 20 }[privacy]
  return {
    entity: {
      gists: {
        count,
        nodes: [
          ...Array.from({ length: count }, (_, i) => ({
            stargazers: faker.number.int({ max: 100 }),
            forked: i % 2 === 0,
            forks: {
              count: faker.number.int({ max: 100 }),
            },
            files: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
              name: faker.system.fileName(),
            })),
            comments: {
              count: faker.number.int({ max: 100 }),
            },
          })),
          null,
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  }
})
