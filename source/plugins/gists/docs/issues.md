---
title: Known issue when using a fine-grained personal access token
type: warning
---

Even if the provided fine-grained personal access token has the `gists` scope, the GitHub GraphQL API seems to refuse serving gist data.

As a workaround, it is possible to create a
[classic personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic) and to
override the token used for this plugin.

```yml
plugins:
  - gists:
    token: github_token_classic
```
