import { is, mock } from "@engine/utils/testing.ts"

export default mock({
  login: is.string(),
  privacy: is.enum(["PUBLIC", "PRIVATE"]).nullable(),
  archived: is.boolean().nullable(),
  forked: is.boolean().nullable(),
  affiliations: is.array(is.enum(["OWNER", "COLLABORATOR", "ORGANIZATION_MEMBER"])).nullable(),
  sort: is.enum(["CREATED_AT", "UPDATED_AT", "PUSHED_AT", "NAME", "STARGAZERS"]),
}, ({ login, ...filter }) => {
  const nodes = []
  if (["empty", "retry"].includes(login)) {
    nodes.push({ name: `testing/${login}` })
  } else {
    for (const affiliation of ["OWNER", "COLLABORATOR", "ORGANIZATION_MEMBER"] as const) {
      if ((Array.isArray(filter.affiliations)) && (!filter.affiliations.includes(affiliation))) {
        continue
      }
      for (const forked of [true, false]) {
        if ((typeof filter.forked === "boolean") && (filter.forked !== forked)) {
          continue
        }
        for (const archived of [true, false]) {
          if ((typeof filter.archived === "boolean") && (filter.archived !== archived)) {
            continue
          }
          for (const privacy of ["PUBLIC", "PRIVATE"]) {
            if ((typeof filter.privacy === "string") && (filter.privacy !== privacy)) {
              continue
            }
            nodes.push({
              name: `${{ OWNER: login, COLLABORATOR: "user", ORGANIZATION_MEMBER: "org" }[affiliation]}/${
                [privacy.toLocaleLowerCase(), archived ? "archived" : "", forked ? "forked" : "", "repo"].filter((value) => value).join("-")
              }`,
            })
          }
        }
      }
    }
  }
  return {
    entity: {
      repositories: {
        nodes,
      },
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
    },
  }
})
