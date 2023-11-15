import { faker, mock } from "@engine/utils/testing.ts"

export default mock({}, () => {
  return fetch(faker.image.urlLoremFlickr())
})
