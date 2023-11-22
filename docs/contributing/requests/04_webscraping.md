## 🕸️ Using web scraping

Data may be harvested using web scraping when no API is available or for advanced use cases. Note that this method is often slower and less reliable, as it requires spawning a browser instance and
relying on unstable DOM structures.

It can also be used to perform content manipulation, which can be useful in processors.

Web scraping is abstracted by `Browser` from [`@engine/utils/browser.ts`](/source/engine/utils/browser.ts), which is using [Astral](https://github.com/lino-levan/astral) library under the hood.

Navigation is subject to [Deno permissions](https://docs.deno.com/runtime/manual/basics/permissions) which means that resources cannot be accessed without associated grants.

**Useful resources**

- [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Learn)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol)
- [Astral documentation](https://astral.deno.dev)

### 1️⃣ Create a DOM-enabled function

Create a new `.ts` file inside the `dom/` subdirectory with a single exported default function.

```ts
// dom/example.ts
/// <reference lib="dom" />
/** Example function */
export default function (foo: string) {
  return { foo, main: document.querySelector("main")?.innerHTML }
}
```

### 2️⃣ Execute the DOM function

Use `Browser.page()` method to spawn a new browser page. Enclose the code in a `try`/`finally` block to ensure the page is closed after execution to avoid memory leaks.

```ts
// mod.ts
const page = await Browser.page({ log: this.log })
try {
  // ...
} finally {
  await page.close()
}
```

When using "local content", use `Format.html()` method from [`@engine/utils/format.ts`](/source/engine/utils/format.ts) to wrap the HTML content in a valid document inside a `<main/>` tag.

```ts
// mod.ts
await page.setContent(Format.html("<svg><text>Example</text></svg>"))
```

To evaluate a DOM function, use `Page.evaluate()` method using the `dom://` protocol.

```ts
// mod.ts
const { foo, main } = await page.evaluate("dom://example.ts", { args: ["foo"] })
```
