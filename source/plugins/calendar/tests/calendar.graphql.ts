import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ login: is.string(), from: is.coerce.date(), to: is.coerce.date() }, ({ from, to }) => {
  let days = []
  const weeks = []
  const distribution = [[0, 50], [1, 15], [2, 15], [3, 5], [4, 5], [5, 3], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1]].flatMap(([n, r]) => new Array(r).fill(n))
  const max = Math.max(...distribution)
  if (from.getFullYear() > 1970) {
    for (const date = new Date(from); date <= to; date.setUTCDate(date.getUTCDate() + 1)) {
      if ((!date.getUTCDay()) && (date.getTime() !== from.getTime())) {
        weeks.push({ days })
        days = []
      }
      const count = faker.helpers.arrayElement(distribution)
      days.push({
        count,
        level: count ? ["FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"][Math.floor(3 * count / max)] as string : "NONE",
        date: new Date(date),
      })
    }
  }
  weeks.push({ days })
  return {
    entity: {
      contributions: {
        calendar: {
          weeks,
        },
      },
    },
  }
})
