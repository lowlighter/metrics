import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ search: is.string() }, () => ({
  search: {
    pullrequests: [
      {
        number: faker.number.int(),
        title: faker.git.commitMessage(),
        id: faker.string.nanoid(),
      },
    ],
  },
}))
