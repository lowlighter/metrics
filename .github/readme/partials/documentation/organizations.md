### 🏦 Organizations metrics

While metrics targets mainly user accounts, it's possible to render metrics for organization accounts.

![Metrics (organization account)](https://github.com/lowlighter/lowlighter/blob/master/metrics.organization.svg)

<details>
<summary><b>💬 Metrics for organizations</b> <i>(click to expand)</i></summary>

Setup is the same as for user accounts, though you'll need to add `read:org` scope, **whether you're member of target organization or not**.

![Add read:org scope to personal token](.github/readme/imgs/setup_token_org_read_scope.png)

You'll also need to set `user` option with your organization name.

If you're encounting errors and your organization is using single sign-on, try to [authorize your personal token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on).

Most of plugins supported by user accounts will work with organization accounts, but note that rendering metrics for organizations consume way more APIs requests.

To support private repositories, add full `repo` scope to your personal token.

#### ℹ️ Example workflow

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    token: ${{ secrets.METRICS_TOKEN }}          # A personal token from an user account with read:org scope
    committer_token: ${{ secrets.GITHUB_TOKEN }} # GitHub auto-generated token
    user: organization-name                      # Organization name
```

</details>

<details>
<summary><b>💬 Organizations memberships for user accounts</b> <i>(click to expand)</i></summary>

Only public memberships can be displayed by metrics by default.
You can manage your membership visibility in the `People` tab of your organization:

![Publish organization membership](.github/readme/imgs/setup_public_membership_org.png)

For organization memberships, add `read:org` scope to your personal token.

![Add read:org scope to personal token](.github/readme/imgs/setup_token_org_read_scope.png)


</details>
