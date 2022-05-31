# ⚙️ Using GitHub Action on a profile repository (~10 min)

Setup a GitHub Action which runs periodically and pushes generated images to a repository.

## 0️ Setup a personal repository

Create a repository with the same name as your GitHub login (if it doesn't exist).

![Setup personal repository](/.github/readme/imgs/setup_personal_repository.light.png#gh-light-mode-only)
![Setup personal repository](/.github/readme/imgs/setup_personal_repository.dark.png#gh-dark-mode-only)

Its `README.md` will be displayed on your user profile:

![GitHub Profile Example](/.github/readme/imgs/example_github_profile.light.png#gh-light-mode-only)
![GitHub Profile Example](/.github/readme/imgs/example_github_profile.dark.png#gh-dark-mode-only)

## 1️ Create a GitHub personal token

> 💡 A GitHub personal token is required since this action will fetch data that cannot be accessed through repository-scoped tokens (like [`${{ secrets.GITHUB_TOKEN }}` or `${{ github.token }}`](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#about-the-github_token-secret)) such as users, organizations, issues, pull requests, comments, commits, activity, etc.

From the `Developer settings` of your account settings, select `Personal access tokens` to create a new token.

No scopes are required, but additional one may be required depending on which features will be used. Each plugin documentation enumerates which scopes are required to make it work.

A a general rule, the following scopes may be required:
- `public_repo` for some plugins
- `read:org` for all organizations related metrics
- `repo` for all private repositories related metrics
  - `read:user` for some private repositories related metrics
- `read:packages` for some packages related metrics
- `gist` for publishing renders to gists instead of a repository

> 💡 For security reasons, it is advised to always use the least amount of scopes. It is possible to prevent security issues by [forking this repository](https://github.com/lowlighter/metrics/fork) and using it in your workflow instead (more information available in step 3)

![Setup a GitHub personal token](/.github/readme/imgs/setup_personal_token.light.png#gh-light-mode-only)
![Setup a GitHub personal token](/.github/readme/imgs/setup_personal_token.dark.png#gh-dark-mode-only)

A scope-less token can still display private contributions by enabling `Include private contributions on my profile` in account settings:

![Enable "Include private contributions on my profile`"](/.github/readme/imgs/setup_private_contributions.light.png#gh-light-mode-only)
![Enable "Include private contributions on my profile`"](/.github/readme/imgs/setup_private_contributions.dark.png#gh-dark-mode-only)

When a plugin has not enough scopes to operate (and `plugins_errors_fatal` is disabled), an error will be reported in the rendering like below:

![Plugin error example](https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.error.svg)

## 2️ Put your GitHub personal token in repository secrets

Go to the `Settings` of your repository and to create a new secret and paste your freshly generated GitHub token there.

![Setup a repository secret](/.github/readme/imgs/setup_repository_secret.light.png#gh-light-mode-only)
![Setup a repository secret](/.github/readme/imgs/setup_repository_secret.dark.png#gh-dark-mode-only)

## 3️ Setup GitHub Action workflow

Create a new workflow from the `Actions` tab of repository and paste the following:

```yaml
name: Metrics
on:
  # Schedule daily updates
  schedule: [{cron: "0 0 * * *"}]
  # (optional) Run workflow manually
  workflow_dispatch:
  # (optional) Run workflow when pushing on master/main
  push: {branches: ["master", "main"]}
jobs:
  github-metrics:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: lowlighter/metrics@latest
        with:
          token: ${{ secrets.METRICS_TOKEN }}
```

Default output action is to commit rendered metrics to target repository on each run.

![Action update example](/.github/readme/imgs/example_action_update.light.png#gh-light-mode-only)
![Action update example](/.github/readme/imgs/example_action_update.dark.png#gh-dark-mode-only)

Use [`output_action`](/source/plugins/core/README.md#-configuring-output-action) to change this behaviour to use either pull requests, gists or manually handle renders.

### 3️.1️ Choosing between `@latest`, `@master`/`@main`, a fork or a pinned version

There are several *metrics* versions that can be used in workflows:

- `@latest`
  - ✔️ Stable version
- `@master`/`@main`
  - ✔️ Enjoy new features and bug fixes as they're being released
  - ✔️ Helps discovering new issues
  - ➖ Jobs may fail occasionally (watch [issues](https://github.com/lowlighter/metrics/issues) and [discussions](https://github.com/lowlighter/metrics/discussions) for bug tracking)
- `@{fork}`
  - ✔️ Secure as you're in control
  - ✔️ Advised when using additional scopes in personal access token
  - ➖ Manual updates (watch new [releases](https://github.com/lowlighter/metrics/releases) for updates)
- `@v{x}.{x}`
  - ➖ Pinned versions have no real advantages

> 💡 Workflows are always compatible with previous version as *metrics* workflow-breaking changes are never introduced. In fact, even workflows from v1.0 are still compatible!

*Example: using a forked version*
```yaml
  - uses: user/metrics@master
```

> ⚠️ Be sure to use the default branch (`@master`) on forks to apply any changes made!

### 3️.2️ Configure *metrics*

Read [documentation](/README.md#-documentation) for more informations about configuration.
It is advised to start with [`🧱 core`](/source/plugins/core/README.md) plugin documentation.

It is also possible to use [metrics.lecoq.io](https://metrics.lecoq.io) to play with configuration options, preview renders and finally copy the auto-generated workflow code.

## 4️ Add images to your profile `README.md`

Update profile `README.md` to include rendered image (filename may differ if `filename` option has been set, use the correct path accordingly).

*Example: add rendered image with markdown*
```markdown
![Metrics](/github-metrics.svg)
```

*Example: add rendered image with html for more customization*
```html
<img align="center" src="/github-metrics.svg" alt="Metrics" width="400">
```

*Example: add rendered image when using `config_display: columns`*
```html
<img src="/github-metrics.svg" alt="Metrics" width="100%">
```
