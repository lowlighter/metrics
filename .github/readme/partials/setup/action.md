## ⚙️ Using GitHub Action on your profile repository (~5 min setup)

Setup a GitHub Action which runs periodically and pushes your generated metrics image to your repository.
See all supported options in [action.yml](/action.yml).

Assuming your username is `my-github-user`, you can then embed rendered metrics in your readme like below:

```markdown
<!-- If you're using "master" as default branch -->
![Metrics](https://github.com/my-github-user/my-github-user/blob/master/github-metrics.svg)
<!-- If you're using "main" as default branch -->
![Metrics](https://github.com/my-github-user/my-github-user/blob/main/github-metrics.svg)
```

<details>
<summary><b>💬 How to setup?</b> <i>(click to expand)</i></summary>

<%- await include(`/partials/setup/action/setup.md`) -%>

</details>
