<!-- <% if (false) { %> -->
#### 💬 How to setup?
<!-- <% } %> -->

### 0. Prepare your server

You'll need a server with a recent version of [Docker](https://www.docker.com/).

### 1. Create a GitHub personal token

From the `Developer settings` of your account settings, select `Personal access tokens` to create a new token.

No additional scopes are needed.

![Setup a GitHub personal token](/.github/readme/imgs/setup_personal_token.png)

### 2. Configure your instance

Fetch [settings.example.json](/settings.example.json) which contains all supported option.
```shell
wget https://raw.githubusercontent.com/lowlighter/metrics/master/settings.example.json
```

Edit `settings.json` to configure your instance.

```javascript
{
  //GitHub API token
    "token":"GITHUB_TOKEN",
  //Other options...
}
```

If you plan to make your web instance public, it is advised to restrict its access thanks to rate limiter and access list.

### 3. Start docker container

Metrics docker images are published on [GitHub Container Registry](https://github.com/lowlighter/metrics/pkgs/container/metrics).

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
docker run -d --workdir=/metrics --entrypoint="" -p=127.0.0.1:$PUBLISHED_PORT:$SERVICE_PORT --volume=$SETTINGS:/metrics/settings.json ghcr.io/lowlighter/metrics:$VERSION npm start
```

### 4. Embed link into your README.md

Edit your repository readme and add your metrics image from your server domain:

```markdown
![Metrics](https://my-personal-domain.com/my-github-user)
```

### 5. (optional) Setup your instance as a service

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
ExecStart=(command to run as service)

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

### Alternative option: run an instance locally (intended for testing and development)

To run an instance without docker, you'll need to have [NodeJS](https://nodejs.org) (see used version in [Dockerfile](/Dockerfile#L1-L2)) installed.

Clone repository, install dependencies and copy configuration example to `settings.json`:

```shell
git clone https://github.com/lowlighter/metrics.git
cd metrics/
npm install --only=prod
cp settings.example.json settings.json
```

Once you've finished configuring metrics, start your instance using the following command:

```shell
npm start
```

You should now be able to access your server with provided port in `setting.json` from your browser.
