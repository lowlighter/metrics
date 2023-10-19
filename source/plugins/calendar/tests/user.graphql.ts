import { faker, is, mock } from "@utils/testing.ts"

export default mock({ login: is.string() }, () => ({
  entity: {
    registration: faker.date.past({ years: 3 }),
  },
}))
