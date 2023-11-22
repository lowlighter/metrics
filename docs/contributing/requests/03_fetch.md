## 📩 Using `fetch()`

Fetching resources is abstracted by `Requests.fetch()` method from [`@engine/components/requests.ts`](/source/engine/components/requests.ts), which is using the native
[`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) function under the hood.

In plugins, requests can be performed through the `Plugin.fetch()` method. In processors, requests can be performed through the `Processor.requests.fetch()` method only if `Processor.requesting` is
set to `true`.

Navigation is subject to [Deno permissions](https://docs.deno.com/runtime/manual/basics/permissions) which means that resources cannot be accessed without associated grants.

**Useful resources**

- [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Learn)
- [`fetch()` documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### 1️⃣ Execute an HTTP query

Use the `fetch()` method to perform an HTTP query. It accepts two arguments:

1. The URL to query
2. An optional object with the following properties:

- `type`: A conversion to apply (either `"json"`, `"text"`, or `"response"` to receive the raw response object)
- `options`: The options to pass to the native [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) function

```ts
const { foo } = await this.fetch("https://metrics.test/example", { type: "json", options: { method: "GET" } })
```

### 2️⃣ Create a mocked HTTP response for testing

Create a new `.http.ts` file inside the `tests/` subdirectory _(file name must match the url pathname)_. Any HTTP request to the `.test` TLD will be intercepted and mocked using the associated file.

```ts
// example.http.ts
import { faker, mock } from "@engine/utils/testing.ts"

export default mock({}, () => {
  return { foo: faker.lorem.word() }
})
```
