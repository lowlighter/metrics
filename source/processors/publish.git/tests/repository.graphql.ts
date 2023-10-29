import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ owner: is.string(), repo: is.string() }, () => ({
  repository: {
    id: faker.string.nanoid(),
  },
}))
