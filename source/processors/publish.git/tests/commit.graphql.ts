import { faker, is, mock } from "@utils/testing.ts"

export default mock({ repository: is.string(), branch: is.string(), message: is.string(), path: is.string(), contents: is.string(), head: is.string() }, () => ({
  mutation: {
    commit: {
      oid: faker.git.commitSha(),
    },
  },
}))
