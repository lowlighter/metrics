# 🏗️ Deploying a web instance (~20 min)

Setup a *metrics* web instance on your server.

## 0️ Prepare your server

A server with a recent version of [docker](https://www.docker.com/) is required.

## 1️ Create a GitHub personal token

From the `Developer settings` of your account settings, select `Personal access tokens` to create a new token.

No additional scopes are required.

> 💡 For security reasons, it is advised to use a scope-less token for web instances.

![Setup a GitHub personal token](/.github/readme/imgs/setup_personal_token.light.png#gh-light-mode-only)
![Setup a GitHub personal token](/.github/readme/imgs/setup_personal_token.dark.png#gh-dark-mode-only)

## 2️ Configure *metrics*

Fetch a copy of [`settings.example.json`](/settings.example.json) and rename it `settings.json`
```shell
wget https://raw.githubusercontent.com/lowlighter/metrics/master/settings.example.json
mv settings.example.json settings.json
```

Edit `settings.json` to configure your instance.

*Example: minimal configuration*
```javascript
{
  "token": "GITHUB_TOKEN",
}
```

### 2️.1️ Restricting access to your web instance

If you intend to make your web instance public, it is advised to restrict access using an access list or rate-limiting it.

Only authorized users will be able to generate images.

*Example: restricted access server*
```javascript
{
  "restricted": ["user1", "user2", "user3"],
  "maxusers": 2,
  "ratelimiter": {
    "windowMs": 900000,
	  "max": 100
  }
}
```

### 2️.2️ Global configuration

Configuration file also contains settings about enabled templates, plugins and features.

*Example: additional server configuration*
```javascript
{
  "cached": 3600000,
  "port": 3000,
  "templates": {
    "default": "classic",
    "enabled": ["classic", "terminal"],
  },
  "community": {
    "templates": ["user/repo@main:custom-theme"],
  },
  "hosted": {
    "by": "me",
    "link": "https://user.me",
  },
  "plugins": {
    "isocalendar":{
      "enabled": false
    }
  }
}
```

### 2️.3️ Extra features configuration

Extra features are a way to enable and control advanced functionality in plugins, which are usually either CPU or API intensive, require access to filesystem or binaries, and sometimes also allow remote code execution.

> ⚠️ Please understand that some extras features may compromise container integrity or security.
> Never use them if outside a containerized or development environment!
>
> Use at your own risk, *metrics* and its authors cannot be held responsible for any damage caused.

*Example: extra features server configuration*
```javascript
{
  "extras": {
    "features": [
      "metrics.setup.community.templates",
      "metrics.api.github.overuse",
      "metrics.cpu.overuse",
      "metrics.run.puppeteer.scrapping",
    ]
  }
}
```

The following extra features are supported:
| Extra feature identifier            | Description                                               |
| ----------------------------------- | --------------------------------------------------------- |
| `metrics.setup.community.templates` | Allow community templates download                        |
| `metrics.setup.community.presets`   | Allow community presets usage                             |
| `metrics.api.github.overuse`        | Allow GitHub API intensive requests                       |
| `metrics.api.*`                     | Allow use of external API requests                        |
| `metrics.cpu.overuse`               | Allow CPU intensive requests                              |
| `metrics.run.tempdir`               | Allow access to temporary directory (including I/O)       |
| `metrics.run.git`                   | Allow to run git                                          |
| `metrics.run.licensed`              | Allow to run licensed                                     |
| ⚠️ `metrics.run.user.cmd`           | Allow to run ANY command by user (USE WITH CAUTION! May result in token leaks by malicious users)                                                                |
| `metrics.run.puppeteer.scrapping`   | Allow to run puppeteer to scrape data                     |
| `metrics.run.puppeteer.user.css`    | Allow to run CSS by user during puppeteer render          |
| `metrics.run.puppeteer.user.js`     | Allow to run JavaScript by user during puppeteer render   |
| ⚠️ `metrics.npm.optional.*`        | Allow use of specified dependency (CONSULT RESPECTIVE DEPENDENCY CVE FIRST) |

If a plugin is used without sufficient permissions, it will result in an error.

## 3️ Start docker container

Docker images are published on [GitHub Container Registry](https://github.com/lowlighter/metrics/pkgs/container/metrics).

Configure the following variables (or hardcode them in the command in the next block):
```shell
# Select an existing docker image tag
VERSION=latest
# Path to configured `settings.json`
SETTINGS=/path/to/settings.json
# Port used internally (use the same one than in `settings.json`)
SERVICE_PORT=3000
# Port to publish
PUBLISHED_PORT=80
```

And start the container using the following command:
```shell
docker run --rm --entrypoint="" -p=127.0.0.1:$PUBLISHED_PORT:$SERVICE_PORT --volume=$SETTINGS:/metrics/settings.json ghcr.io/lowlighter/metrics:$VERSION npm start
```

## 4️ Add images to your profile `README.md`

Update profile `README.md` to include rendered image.

*Example: add rendered image with markdown*
```markdown
![Metrics](https://my.server.com/username)
```

### 4️.1️ URL parameters syntax

The GitHub action and the web instance uses the same engine behind the hood.

It is actually possible to generate image directly from url without passing by the web ui by knowing how to pass parameters.

Parameters for the web instance:
- use dots (`.`) instead of underscores (`_`)
- does not use `plugin_` prefixes
- special characters need to be url [encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)

*Example: configuring `⏱️ pagespeed` plugin for [https://example.org](https://example.org/)*
```html
<img src="https://my.server.com/username?pagespeed=1&pagespeed.detailed=1&pagespeed.url=https%3A%2F%2Fexample.com">
```

`🗃️ base` plugin use a slightly different notation where sections are configured through `base.<section>` param.

*Example: configuring `🗃️ base` plugin to display only repositories section*
```html
<img src="https://my.server.com/username?base=0&base.repositories=1">
```

## *️⃣ Create a service (optional)

To ensure that service will restart after reboots or crashes, it is advised to setup it as a service.
This is described below for Linux-like systems which support *systemd*.

Create a new service file `/etc/systemd/system/github_metrics.service` and paste the following:
```ini
[Unit]
Description=Metrics
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=# docker command #

[Install]
WantedBy=multi-user.target
```

Reload services, enable it, start it and check if it is up and running:
```shell
systemctl daemon-reload
systemctl enable github_metrics
systemctl start github_metrics
systemctl status github_metrics
```
