import { expect, t } from "@engine/utils/testing.ts"
import { shuffle } from "@engine/utils/shuffle.ts"

Deno.test(t(import.meta, "`shuffle()` shuffles the content of array"), { permissions: "none" }, () => {
  const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const shuffled = shuffle(array)
  expect(shuffled).to.not.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  expect(array).to.equal(shuffled)
})
