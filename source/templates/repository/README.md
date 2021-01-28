### 📘 Repository

Template crafted for repositories, mimicking GitHub visual identity.

<table>
  <td>
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.repository.svg">
  </td>
</table>

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    template: classic
    user: repository-owner              # Optional if you're the owner of target repository
    query: '{"repo":"repository-name"}' # Use a JSON encoded object to pass your repository name in "repo" key
```
