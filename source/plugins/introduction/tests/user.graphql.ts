import { faker, is, mock } from "@testing"

export default mock({ login: is.string() }, ({ login }) => ({
  entity: {
    text: `${login}: ${faker.person.jobTitle()}`,
  },
}))
