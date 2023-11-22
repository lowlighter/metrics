import { faker, mock } from "@engine/utils/testing.ts"

export default mock({}, () => {
  return { foo: faker.lorem.word() }
})
