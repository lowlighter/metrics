<!-- <% if (false) { %> -->
#### 💬 How to setup?
<!-- <% } %> -->

### 0. Prepare your server

You'll need a server with a recent version [NodeJS](https://nodejs.org) (see used version in [Dockerfile](/Dockerfile#L1-L2)).

### 1. Create a GitHub personal token

From the `Developer settings` of your account settings, select `Personal access tokens` to create a new token.

No additional scopes are needed.

![Setup a GitHub personal token](/.github/readme/imgs/setup_personal_token.png)

### 2. Install dependencies

Clone repository, install dependencies and copy configuration example to `settings.json`:

```shell
git clone https://github.com/lowlighter/metrics.git
cd metrics/
npm install --only=prod
cp settings.example.json settings.json
```

### 3. Configure your instance and start it

Edit `settings.json` to configure your instance.

```javascript
{
  //GitHub API token
    "token":"GITHUB_TOKEN",
  //Other options...
}
```

See all supported options in [settings.example.json](/settings.example.json).

If you plan to make your web instance public, it is advised to restrict its access thanks to rate limiter and access list.

Once you've finished configuring metrics, start your instance:

```shell
npm start
```

Access your server with provided port in `setting.json` from your browser to ensure everything is working.

### 4. Embed link into your README.md

Edit your repository readme and add your metrics image from your server domain:

```markdown
![Metrics](https://my-personal-domain.com/my-github-user)
```

### 6. (optional) Setup your instance as a service

To ensure that your instance will restart if it reboots or crashes, you should set it up as a service.
This is described below for Linux-like systems which support *systemd*.

Create a new service file `/etc/systemd/system/github_metrics.service` and paste the following after editing paths inside:

```ini
[Unit]
Description=Metrics
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/path/to/metrics
ExecStart=/usr/bin/node /path/to/metrics/index.mjs

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