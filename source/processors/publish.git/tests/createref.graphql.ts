import { is, mock } from "@utils/testing.ts"

export default mock({ branch: is.string(), base: is.string(), repository: is.string() }, ({ branch }) => ({
  mutation: {
    ref: {
      name: branch,
    },
  },
}))
