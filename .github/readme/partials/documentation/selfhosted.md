# 🏠 Run metrics on self-hosted runners

## 0️ Setup a self-hosted runner

Learn more about hosting runners on [GitHub documentation](https://docs.github.com/en/actions/hosting-your-own-runners).

> ⚠️ To run *metrics* on a self-hosted runner, the following dependencies needs to be installed on runner:
> - [docker](https://www.docker.com)
> - [jq](https://github.com/stedolan/jq)

Go to repository settings, and select `Runners` under the `Actions` side tab.

![Add a self-hosted runner](/.github/readme/imgs/setup_selfhosted_create.light.png#gh-light-mode-only)
![Add a self-hosted runner](/.github/readme/imgs/setup_selfhosted_create.dark.png#gh-dark-mode-only)

> ⚠️ Working user **must be able** to run docker. If *metrics* is run with an unprivileged user, ensure it can open `/var/run/docker.sock`
>
> Use the following workaround when receiving the following error: `dial unix /var/run/docker.sock: connect: permission denied`
> ```bash
> usermod -a -G docker $USER
> chown root:docker /var/run/docker.sock
> ```

## 1️ Update workflows to use self-hosted runners

To run *metrics* action on a self-hosted runner, uses `runs-on: self-hosted`.

*Example: render metrics for `github` organization*
```yaml
runs-on: self-hosted
steps:
  - uses: lowlighter/metrics@latest
    with:
      token: ${{ secrets.METRICS_TOKEN }}
```

> 💡 To easily debug workflow errors, use [`debug: yes`](https://github.com/lowlighter/metrics/tree/master/source/plugins/core#debug) option
