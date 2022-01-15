# 🏦 Configure metrics for organizations

While metrics targets mainly user accounts, it's possible to render metrics for organization accounts.

![Metrics (organization account)](https://github.com/lowlighter/metrics/blob/examples/metrics.organization.svg)

## *️⃣ Using *metrics* on organization

Setup is the same as for user accounts, and a personal access token from an user account is required excepted that `read:org` scope must be enabled, **whether you are member of the target organization or not**.

![Add read:org scope to personal token](/.github/readme/imgs/setup_token_org_read_scope.png)

`user` option will need to be set to organization name instead.

*Example: render metrics for `github` organization*
```yaml
- uses: lowlighter/metrics@latest
  with:
    token: ${{ secrets.METRICS_TOKEN }}
    user: github
```

> 💡 If your organization using single sign-on, you may need to [authorize your personal token access](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on)

> 💡 Plugins supporting organizations account are labeled with `👥 Organizations`. Note that rendering consume way more API requests and huge organization may not actually be able to use a given plugin.

> 💡 To support private repositories, add `repo` scope

## *️⃣ Organizations memberships for user accounts

By default, GitHub only display public memberships.
Membership visibility canbe managed in the `People` tab of your organization.

![Publish organization membership](/.github/readme/imgs/setup_public_membership_org.png)

> ⚠️ Seeing your organization membership in your profile **does not** mean that it is visible from other users! You can check this by viewing your profile in an private browser window.

