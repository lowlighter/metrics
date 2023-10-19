import { faker, is, mock } from "@utils/testing.ts"

export default mock({ login: is.string() }, ({ login }) => ({
  entity: {
    text: `${login}: ${faker.person.jobTitle()}`,
  },
}))
