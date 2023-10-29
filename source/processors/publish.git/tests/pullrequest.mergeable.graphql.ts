import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ search: is.string() }, () => ({
  repository: {
    pullrequest: {
      mergeable: faker.helpers.arrayElement(["CONFLICTING", "MERGEABLE", "UNKNOWN"]),
    },
  },
}))
