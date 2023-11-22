## ✉️ Using GitHub REST API

REST API requests are abstracted by `Requests.rest()` method from [`@engine/components/requests.ts`](/source/engine/components/requests.ts).

In plugins, requests can be performed through the `Plugin.rest()` method. In processors, requests can be performed through the `Processor.requests.rest()` method only if `Processor.requesting` is set
to `true`.

**Useful resources**

- [GitHub REST API documentation](https://docs.github.com/en/rest)
- [Octokit documentation](https://octokit.github.io/rest.js/v20)

### 1️⃣ Executing a REST query

Use the `rest()` method to execute a REST query. It accepts three arguments:

1. The octokit REST method to query
2. An optional object with the variables to pass to the query
3. An optional object with the following properties:

- `paginate`: Whether the query is paginated and should be executed until cursor reaches the end

```ts
// mod.ts
const zen = this.rest(this.api.meta.getZen)
```

### 2️⃣ Creating a mocked REST response for testing

Create a single `rest.ts` file inside the `tests/` subdirectory.

```ts
// tests/rest.ts
import { mock, Status } from "@engine/utils/testing.ts"

export default {
  "/zen": mock({}, () => ({
    status: Status.OK,
    data: new TextEncoder().encode("Anything added dilutes everything else."),
  })),
}
```

A single default object should be exported, mapping REST endpoints to mocked responses.

The `mock()` function accepts two arguments:

1. The schema of the response, described using [Zod](https://zod.dev) _(it should match the REST variables description)_
2. A callback function that receives the parsed variables and returns a mocked response including both HTTP status and data.
