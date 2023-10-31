import { faker, is, mock, throws } from "@engine/utils/testing.ts"

export default mock({ repository: is.string(), branch: is.string(), message: is.string(), path: is.string(), contents: is.string(), head: is.string() }, ({ path }) => {
  if (path.includes("unchanged")) {
    throws("Expected `commit.graphql` to not be called as it was supposed to be an unchanged file")
  }
  return {
    mutation: {
      commit: {
        oid: faker.git.commitSha(),
      },
    },
  }
})
