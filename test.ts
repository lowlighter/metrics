const { Requests } = await import("@engine/components/requests.ts")
const requests = new Requests(import.meta, { logs: "trace", token: { read: () => "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" } } as any)

console.log(await requests.rest(requests.api.users.getByUsername, { username: "github" }))
