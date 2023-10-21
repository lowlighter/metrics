import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ login: is.string() }, ({ login }) => ({
  entity: {
    text: `${login}: ${faker.company.catchPhrase()}`,
  },
}))
