## 📧 Using GitHub GraphQL API

The preferred way to interact with GitHub is using the GraphQL API, which is usually more powerful and flexible than the REST API.

GraphQL API requests are abstracted by `Requests.graphql()` method from [`@engine/components/requests.ts`](/source/engine/components/requests.ts).

In plugins, requests can be performed through the `Plugin.graphql()` method. In processors, requests can be performed through the `Processor.requests.graphql()` method only if `Processor.requesting`
is set to `true`.

**Useful resources**

- [GraphQL introduction](https://graphql.org/learn)
- [GitHub GraphQL API documentation](https://docs.github.com/en/graphql)
- [GitHub GraphQL explorer](https://docs.github.com/en/graphql/overview/explorer)

### 1️⃣ Creating a GraphQL query

Create a new `.graphql` file inside the `queries/` subdirectory.

```graphql
# queries/example.graphql
query Example($login: String!) {
  entity: user(login: $login) {
    name
  }
}
```

Fields should be renamed to keep consistency with the rest of the codebase, but also to ease the handling of data when a query is compatible with different entities.

### 2️⃣ Executing a GraphQL query

Use the `graphql()` method to execute a GraphQL query. It accepts three arguments:

1. The name of the query file _(without the extension)_
2. An optional object with the variables to pass to the query
3. An optional object with the following properties:

- `paginate`: Whether the query is paginated and should be executed until cursor reaches the end

```ts
// mod.ts
const { entity: { name } } = await this.graphql("example", { login: handle })
```

A paginated GraphQL query is handled by [@octokit/plugin-paginate-graphql](https://github.com/octokit/plugin-paginate-graphql.js) and must contain the following fields:

```graphql
pageInfo {
  hasNextPage
  endCursor
}
```

### 3️⃣ Creating a mocked GraphQL response for testing

Create a new `.graphql.ts` file inside the `tests/` subdirectory _(file name must match the query file name)_.

```ts
// tests/example.graphql.ts
import { faker, is, mock } from "@engine/utils/testing.ts"

export default mock({ login: is.string() }, ({ login }) => ({
  entity: {
    name: `${login} ${faker.person.lastName()}`,
  },
}))
```

The `mock()` function accepts two arguments:

1. The schema of the response, described using [Zod](https://zod.dev) _(it should match the GraphQL variables description)_
2. A callback function that receives the parsed variables and returns a mocked response
