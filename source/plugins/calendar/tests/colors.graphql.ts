import { is, mock } from "@engine/utils/testing.ts"

export default mock({ login: is.string() }, () => ({
  entity: {
    contributions: {
      calendar: {
        colors: [
          "#9be9a8",
          "#40c463",
          "#30a14e",
          "#216e39",
        ],
      },
    },
  },
}))
