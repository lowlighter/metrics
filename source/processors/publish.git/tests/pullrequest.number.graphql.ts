import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ search: is.string() }, ({ search }) => {
  const pullrequests = [
    {
      number: search.includes("conflicting") ? 2 : 1,
      title: faker.git.commitMessage(),
      id: faker.string.nanoid(),
    },
  ]
  if (search.includes("multiple-results")) {
    pullrequests.push({
      number: faker.number.int({ min: 1000 }),
      title: faker.git.commitMessage(),
      id: faker.string.nanoid(),
    })
  }
  if (search.includes("no-results")) {
    pullrequests.splice(0, pullrequests.length)
  }
  return {
    search: {
      pullrequests,
    },
  }
})
