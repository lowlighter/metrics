import { is, mock } from "@engine/utils/testing.ts"

export default mock({ foo: is.boolean() }, ({ foo }) => ({
  bar: foo,
}))
