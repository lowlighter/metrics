import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ method: is.enum(["MERGE", "SQUASH", "REBASE"]), pr: is.string() }, ({ pr }) => ({
  pullrequest: {
    number: pr,
    id: faker.string.nanoid(),
  },
}))
