import { faker, is, mock } from "@testing"

export default mock({ login: is.string() }, () => ({
  entity: {
    registration: faker.date.past({ years: 3 }),
  },
}))
