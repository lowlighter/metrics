import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ owner: is.string(), repo: is.string(), branch: is.string(), file: is.string() }, ({ branch, file }) => {
  if (branch.includes("unexisting")) {
    return {
      repository: {
        branch: null,
        revision: null,
      },
    }
  }
  return {
    repository: {
      branch: {
        history: {
          commits: [
            {
              oid: faker.git.commitSha(),
            },
          ],
        },
      },
      revision: {
        oid: file.includes("unchanged") ? "dc1ced5b6b300cd8543b8528ef4110de79ffbe7d" : faker.git.commitSha(),
      },
    },
  }
})
