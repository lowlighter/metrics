import { is, mock } from "@utils/testing.ts"

export default mock({ foo: is.boolean() }, ({ foo }) => ({
  bar: foo,
}))
