## ⚙️ Using GitHub Action on your profile repository (~5 min setup)

Setup a GitHub Action which runs periodically and pushes your generated metrics image to your repository.
See all supported options in [action.yml](action.yml).

Assuming your username is `my-github-user`, you can then embed rendered metrics in your readme like below:

```markdown
<!-- If you're using "master" as default branch -->
![Metrics](https://github.com/my-github-user/my-github-user/blob/master/github-metrics.svg)
<!-- If you're using "main" as default branch -->
![Metrics](https://github.com/my-github-user/my-github-user/blob/main/github-metrics.svg)
```

<details>
<summary>💬 How to setup?</summary>

### 0. Setup your personal repository

Create a repository with the same name as your GitHub login (if it's not already done).

![Setup personal repository](.github/readme/imgs/setup_personal_repository.png)

Its `README.md` will be displayed on your user profile:

![GitHub Profile Example](.github/readme/imgs/example_github_profile.png)

### 1. Create a GitHub personal token

From the `Developer settings` of your account settings, select `Personal access tokens` to create a new token.

No additional scopes are needed for basic metrics, but you may have to grant additional scope depending on what features you're planning to use:
- `public_repo` scope for some plugins
- `read:org` scope for all organizations related metrics
- `repo` scope for all private repositories related metrics

![Setup a GitHub personal token](.github/readme/imgs/setup_personal_token.png)

A scope-less token can still display private contributions by enabling `Include private contributions on my profile` in your account settings:

![Enable "Include private contributions on my profile`"](.github/readme/imgs/setup_private_contributions.png)

If a plugin has not enough scopes to operate (and `plugins_errors_fatal` isn't enabled), it'll be reported in the rendering like below:

![Plugin error example](https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.error.svg)

### 2. Put your GitHub personal token in your repository secrets

Go to the `Settings` of your repository to create a new secret and paste your freshly generated GitHub token there.

![Setup a repository secret](.github/readme/imgs/setup_repository_secret.png)

### 3. Create a GitHub Action workflow in your repository

Create a new workflow from the `Actions` tab of your repository and paste the following:

```yaml
name: Metrics
on:
  # Schedule updates (each hour)
  schedule: [{cron: "0 * * * *"}]
  # Lines below let you run workflow manually and on each commit (optional)
  push: {branches: ["master", "main"]}
  workflow_dispatch:
jobs:
  github-metrics:
    runs-on: ubuntu-latest
    steps:
      # See action.yml for all options
      - uses: lowlighter/metrics@latest
        with:
          # Your GitHub token
          token: ${{ secrets.METRICS_TOKEN }}
          # GITHUB_TOKEN is a special auto-generated token restricted to current repository, which is used to push files in it
          committer_token: ${{ secrets.GITHUB_TOKEN }}
```

See all supported options in [action.yml](action.yml).

Rendered metrics will be committed to your repository on each run.

![Action update example](.github/readme/imgs/example_action_update.png)

#### Choosing between `@latest`, `@master` or a fork

If you wish to use new features as they're being released, you can switch from `@latest` to `@master`.
As the latter is used as a development branch, jobs may fail from time to time (although we try to mitigate this).

When using a token with additional permissions, it is advised to fork this repository and use it instead to minimize security risks:
```yaml
      - uses: my-github-username/metrics@master
      # If you make changes on your fork, be sure not leave @latest as tag!
```

In this case, please consider watching new releases to stay up-to-date and enjoy latest features!

`@latest` will be updated on each release soon after [Planned for next release](https://github.com/lowlighter/metrics/projects/1#column-12378679) is emptied. Metrics doesn't introduce breaking changes **from an user point of view** (i.e. your workflows will always be valid) so you can follow release cycles without worrying.

#### Examples workflows

Metrics displayed on this page are rendered from this [workflow](https://github.com/lowlighter/lowlighter/blob/master/.github/workflows/metrics.yml) so you can check it out for some code examples about plugins usage.

You can also take a look at this [user workflow](https://github.com/lowlighter/lowlighter/blob/master/.github/workflows/personal.yml) if you want.

### 4. Embed link into your README.md

Update your README.md to embed your metrics:

```markdown
<!-- If you're using "master" as default branch -->
![Metrics](https://github.com/my-github-user/my-github-user/blob/master/github-metrics.svg)
<!-- If you're using "main" as default branch -->
![Metrics](https://github.com/my-github-user/my-github-user/blob/main/github-metrics.svg)
```

</details>
