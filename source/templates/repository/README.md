### 📘 Repository template

Template crafted for repositories, mimicking GitHub visual identity.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.repository.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Supported formats and inputs](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    template: classic
    user: repository-owner # Optional if you're the owner of target repository and you're using your own personal token
    repo: repository-name  # Repository name
```
