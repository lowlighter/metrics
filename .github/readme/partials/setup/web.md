## 🏗️ Deploying your own web instance (~15 min setup, depending on your sysadmin knowledge)


Setup a metrics instance on your server if you don't want to use GitHub Actions and [metrics.lecoq.io](https://metrics.lecoq.io).
See all supported options in [settings.example.json](/settings.example.json).

Assuming your username is `my-github-user`, you can then embed rendered metrics in your readme like below:

```markdown
![Metrics](https://my-personal-domain.com/my-github-user)
```

<details>
<summary><b>💬 How to setup?</b> <i>(click to expand)</i></summary>

<%- await include(`/partials/setup/web/setup.md`) -%>

</details>

<details>
<summary><b>🔗 HTTP parameters</b> <i>(click to expand)</i></summary>

<%- await include(`/partials/setup/web/http.md`) -%>

</details>
