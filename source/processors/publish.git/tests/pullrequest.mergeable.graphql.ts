import { is, log, mock } from "@engine/utils/testing.ts"

let mergeable = false
let timeout = NaN

export default mock({ pr: is.number() }, ({ pr }) => {
  const state = mergeable ? "MERGEABLE" : "UNKNOWN"
  if (pr === 1) {
    mergeable = true
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      log.io(`pullrequest.mergeable: state reset`)
      mergeable = false
    }, 100)
  }
  return {
    repository: {
      pullrequest: {
        mergeable: ["UNKNOWN", state, "CONFLICTING"][pr],
      },
    },
  }
})
