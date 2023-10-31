import { faker, is, mock, throws } from "@engine/utils/testing.ts"

export default mock({ title: is.string(), message: is.string(), base: is.string(), head: is.string(), repository: is.string() }, ({ head }) => {
  if (head.includes("unchanged")) {
    throws("No commits between")
  }
  if (head.includes("already-exists")) {
    throws("A pull request already exists")
  }
  if (head.includes("unexisting")) {
    throws("Head sha can't be blank, Base sha can't be blank, No commits between, Head ref must be a branch")
  }
  return {
    mutation: {
      pullrequest: {
        id: faker.string.nanoid(),
        number: faker.number.int(),
      },
    },
  }
})
