import { mock } from "@engine/utils/testing.ts"

export default mock({}, () => {
  return new Response(null)
})
