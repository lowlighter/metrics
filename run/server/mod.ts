//Imports
import { serveListener } from "std/http/server.ts"
import { server as schema, webrequest } from "@metrics/config.ts"
import { process } from "@metrics/process.ts"
import { is } from "@utils/validator.ts"
import { listen, read } from "@utils/io.ts"
import { Internal } from "@metrics/components/internal.ts"
import * as YAML from "std/yaml/mod.ts"
import { parseHandle } from "@utils/parse.ts"
import * as Base64 from "std/encoding/base64.ts"
import { serveDir, serveFile } from "std/http/file_server.ts"
import { fromFileUrl } from "std/path/from_file_url.ts"
import { Status } from "std/http/http_status.ts"
import { metadata } from "@metrics/metadata.ts"
import { deferred } from "std/async/deferred.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { formats } from "@processors/render/mod.ts"
import { getCookies, setCookie } from "std/http/cookie.ts"
import { formatValidationError, throws } from "@utils/errors.ts"

const z = await metadata()

/** Server */
class Server extends Internal {
  /** Import meta */
  static readonly meta = import.meta

  /** Context */
  declare protected readonly context: is.infer<typeof schema>

  /** Constructor */
  constructor(context = {} as Record<PropertyKey, unknown>) {
    super(schema.parse(context))
  }

  /** Routes */
  protected readonly routes = {
    index: /^\/(?:index\.html)?$/,
    favicon: /^\/favicon\.(?:ico|png)$/,
    metrics: /^\/(?<handle>[-\w]+(?:\/[-\w]+)?)(?:\.(?<ext>svg|png|jpg|jpeg|webp|json|html))?$/,
    control: /^\/metrics\/$/,
    login: /^\/login(?<action>\/(?:authorize|review)?)?$/,
    me: /^\/me$/,
  }

  /** Start server */
  start() {
    this.log.info(`listening on ${this.context.hostname}:${this.context.port}`)
    return serveListener(listen({ hostname: this.context.hostname, port: this.context.port }), (request) => this.handle(request))
  }

  /** Active sessions */
  #sessions = new Map<string, user>()

  /** State tokens */
  #states = new Set<string>()

  /** Request handler */
  protected async handle(request: Request) {
    const url = new URL(request.url)
    const cookies = getCookies(request.headers)
    const { metrics_session: session = null } = cookies
    const log = session ? this.log.with({ session }) : this.log
    log.io(`${request.method} ${url.pathname}`)
    const pending = new Map<string, Promise<Response>>()
    routing: switch (request.method) {
      case "GET": {
        switch (true) {
          // Serve index
          case this.routes.index.test(url.pathname): {
            return serveFile(request, fromFileUrl(new URL("static/index.html", import.meta.url)))
          }
          // Serve favicon
          case this.routes.favicon.test(url.pathname): {
            return serveFile(request, fromFileUrl(new URL("static/favicon.png", import.meta.url)))
          }
          // Serve static files
          case url.pathname.startsWith("/static/"): {
            return serveDir(request, { fsRoot: fromFileUrl(new URL("static", import.meta.url)), urlRoot: "static", quiet: true })
          }

          case url.pathname === "/metadata": {
            return new Response(JSON.stringify(z), { status: Status.OK, headers: { "content-type": "application/json" } })
          }

          // Authenticated user
          case this.routes.me.test(url.pathname): {
            if ((!session) || (!this.#sessions.has(session))) {
              return new Response("Unauthorized", { status: Status.Unauthorized })
            }
            const { login, name, avatar } = this.#sessions.get(session)!
            return new Response(JSON.stringify({ login, name, avatar }), { status: Status.OK, headers: { "content-type": "application/json" } })
          }
          // OAuth login
          case (this.context.github_app) && (this.routes.login.test(url.pathname)): {
            const app = this.context.github_app!
            const { action = "/" } = url.pathname.match(this.routes.login)?.groups ?? {}
            switch (action) {
              // Start OAuth process
              case "":
              case "/": {
                if (session && (this.#sessions.has(session))) {
                  return Response.redirect(url.origin, Status.Found)
                }
                // Create state
                const state = crypto.randomUUID()
                this.#states.add(state)
                log.trace(`oauth process: ${state} started`)
                // Redirect to GitHub
                const params = new URLSearchParams({ client_id: app.client_id, state, allow_signup: "false" })
                return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, Status.Found)
              }
              // OAuth authorization process
              case "/authorize": {
                if (session && (this.#sessions.has(session))) {
                  return Response.redirect(url.origin, Status.Found)
                }
                try {
                  // Validate state
                  const state = url.searchParams.get("state")
                  if ((!state) || (!this.#states.has(state))) {
                    throws("Invalid state")
                  }
                  this.#states.delete(state)
                  log.trace(`oauth process: ${state} received callback from github app`)
                  // Retrieve token
                  const code = url.searchParams.get("code")
                  if (!code) {
                    throws("Invalid code")
                  }
                  const { access_token: token, expires_in: expiration } = await fetch("https://github.com/login/oauth/access_token", {
                    method: "POST",
                    headers: {
                      "content-type": "application/x-www-form-urlencoded",
                      "accept": "application/json",
                    },
                    body: new URLSearchParams({ client_id: app.client_id, client_secret: app.client_secret, code }),
                  }).then((response) => response.json())
                  log.trace(`oauth process: ${state} retrieved access token`)
                  // Validate token
                  const { login, name, avatar_url } = await fetch("https://api.github.com/user", {
                    headers: { "accept": "application/json", "content-type": "application/json", Authorization: `Bearer ${token}` },
                  }).then((response) => response.json())
                  if ([...this.#sessions.values()].find((session) => session.login === login)) {
                    log.trace(`oauth process: ${state} user ${login} was already authenticated`)
                    return Response.redirect(url.origin, Status.Found)
                  }
                  const user = { login, name, avatar: avatar_url, token, session: crypto.randomUUID() }
                  this.#sessions.set(user.session, user)
                  setTimeout(() => this.#sessions.delete(user.session), 1000 * expiration)
                  log.message(`oauth process: ${state} user ${login} authenticated`)
                  // Redirect to homepage
                  const headers = new Headers({ Location: url.origin })
                  setCookie(headers, { name: "metrics_session", value: user.session, path: "/", sameSite: "None", httpOnly: true, secure: true, expires: new Date(Date.now() + 1000 * expiration) })
                  return new Response(null, { status: Status.SeeOther, headers })
                } catch (error) {
                  log.warn(error)
                  return new Response("Bad request: Authorization process failed", { status: Status.BadRequest })
                }
              }
              // OAuth token revocation
              case "/revoke": {
                if ((!session) || (!this.#sessions.has(session))) {
                  return Response.redirect(url.origin, Status.Found)
                }
                //TODO(@lowlighter): is it not possible to revoke oauth token from github app (this always return not found) ?
                /*const user = this.#sessions.get(session)!
                  console.log(await fetch(`https://api.github.com/applications/${app.client_id}/token`, {method:"DELETE", headers:{
                    "accept": "application/json",
                    Authorization:`Bearer ${app.client_secret}`,
                    "content-type": 'application/json',
                }, body: JSON.stringify({access_token:user.token})}))*/
                return Response.redirect(url.origin, Status.Found)
              }
              // OAuth permissions review
              case "/review": {
                return Response.redirect(`https://github.com/settings/connections/applications/${app.client_id}`, Status.Found)
              }
            }
            break routing
          }

          // Serve renders
          case this.routes.metrics.test(url.pathname): {
            const { handle: _handle, ext = "svg" } = url.pathname.match(this.routes.metrics)?.groups ?? {}
            const { handle, login: user } = parseHandle(_handle)
            const mock = user === "preview" // ?????
            const _log = log
            if (!handle) {
              return new Response("Not found", { status: Status.NotFound })
            }
            {
              const log = _log.with({ handle })
              log.trace(url.href)
              //TODO(@lowlighter): cached system
              //TODO(@lowlighter): max users / single requests

              // Verify requestion extension
              if (!(formats as readonly string[]).includes(ext)) {
                log.trace(`rejected request: "${ext}" is not supported`)
                return new Response(`Unsupported Media Type: ${ext} is not supported`, { status: Status.UnsupportedMediaType })
              }
              // Honor allowed users list
              if ((!mock) && (Array.isArray(this.context.users.allowed)) && (!this.context.users.allowed.includes(user))) {
                log.trace(`rejected request: "${user}" is not allowed`)
                return new Response(`Forbidden: ${user} is not allowed`, { status: Status.Forbidden })
              }
              // Honor single request at a time
              if ((!mock) && (pending.has(handle))) {
                log.trace("existing request pending, waiting for completion")
                return pending.get(handle)
              }
              log.trace("processing request")
              const promise = deferred<Response>()
              pending.set(handle, promise)
              try {
                // Parse inputs (lax-YAML)
                let context = {} as unknown as is.infer<typeof webrequest>
                try {
                  const inputs = {} as Record<PropertyKey, unknown>
                  for (const [key, _value] of url.searchParams) {
                    const value = _value.replaceAll(/([:,])([\w\[\{])/g, "$1 $2")
                    if (_value !== value) {
                      log.trace(`${_value} → ${value}`)
                    }
                    inputs[key] = YAML.parse(value)
                  }
                  context = inputs as unknown as typeof context
                  log.trace("parsed raw request")
                  log.trace(context)
                } catch (error) {
                  log.warn(error)
                  return promise.resolve(new Response(`Bad request: ${formatValidationError(error)}`, { status: Status.BadRequest }))
                }

                // Filter features and apply server configuration
                try {
                  const { plugins } = await webrequest.pick({ plugins: true }).parseAsync(context)
                  context.plugins = plugins.filter(({ id }) => id).concat([{ processors: [{ id: "render", args: { format: { jpg: "jpeg" }[ext] ?? ext } }] }])
                  context = await webrequest.parseAsync(context)
                  log.trace("parsed request")
                  log.trace(context)
                  //TODO(@lowlighter): toggle enabled plugins
                } catch (error) {
                  log.warn(error)
                  return promise.resolve(new Response(`Bad request: ${formatValidationError(error)}`, { status: Status.BadRequest }))
                }

                // Apply server configuration
                try {
                  const extras = {} as Record<PropertyKey, unknown>
                  if (session && (this.#sessions.has(session))) {
                    const user = this.#sessions.get(session)!
                    extras.token = user.token
                    log.debug(`using token from user: ${user.login}`)
                  }
                  context = deepMerge(
                    context,
                    deepMerge(this.context.config, {
                      presets: Object.fromEntries(Object.entries(this.context.config.presets).map(([preset, { plugins }]) => [preset, { plugins: { ...plugins, ...extras, handle, mock } }])),
                    }),
                  )
                  log.trace("applied server configuration")
                  log.trace(context)
                } catch (error) {
                  log.warn(error)
                  // Do not print error to users to avoid data leaks
                  return promise.resolve(new Response("Internal Server Error: Failed to apply server configuration", { status: Status.InternalServerError }))
                }

                // Process request
                try {
                  const { content = "", mime = "image/svg+xml", base64 = false } = await process(context) ?? {}
                  const body = base64 ? Base64.decode(content) : content
                  if (!body) {
                    return promise.resolve(new Response("No content", { status: Status.NoContent }))
                  }
                  return promise.resolve(new Response(body, { status: Status.OK, headers: { "content-type": mime } }))
                } catch (error) {
                  log.warn(error)
                  // Do not print error to users to avoid data leaks
                  return promise.resolve(new Response("Internal Server Error: Failed to process metrics", { status: Status.InternalServerError }))
                }
              } finally {
                log.trace("cleaning request")
                pending.delete(handle)
                log.trace("sending response")
                // deno-lint-ignore no-unsafe-finally
                return promise
              }
            }
          }
        }
        break
      }
      case "POST": {
        /*const middleware = (req, res, next) => {
          console.debug(`metrics/app/control > ${req.url.replace(/[\n\r]/g, "")}`)
          if (req.headers.authorization === conf.settings.control.token) {
            next()
            return
          }
          return res.status(401).send("Unauthorized: invalid token")
        }
        app.post("/.control/stop", limiter, middleware, async (req, res) => {
          console.debug("metrics/app/control > instance will be stopped in a few seconds")
          res.status(202).send("Accepted: instance will be stopped in a few seconds")
          await new Promise(resolve => setTimeout(resolve, 5000))
          process.exit(1)
        })*/
        break
      }
      default:
        return new Response(`Method Not Allowed: ${request.method}`, { status: Status.MethodNotAllowed })
    }
    return new Response("Not found", { status: Status.NotFound })
  }
}

/** User */
type user = { login: string; name: string; avatar: string; token: string; session: string }

// Entry point
if (import.meta.main) {
  const config = await YAML.parse(await read("metrics.config.yml"))
  await new Server(config).start()
}
