import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ title: is.string(), message: is.string(), base: is.string(), head: is.string(), repository: is.string() }, () => ({
  pullrequest: {
    id: faker.string.nanoid(),
    number: faker.number.int(),
  },
}))
