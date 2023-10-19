import { faker, is, mock } from "@utils/testing.ts"

export default mock({ owner: is.string(), name: is.string() }, ({ owner, name }) => ({
  entity: {
    text: `${owner}/${name}: ${faker.company.buzzPhrase()}`,
  },
}))
