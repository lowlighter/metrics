## 💕 Using the shared instance (~1 min setup, but with limitations)

For convenience, you can use the shared instance available at [metrics.lecoq.io](https://metrics.lecoq.io) without any additional setup.

```markdown
![Metrics](https://metrics.lecoq.io/my-github-user)
```

This is mostly intended for previews, to enjoy all features consider using GitHub Action instead.

<details>
<summary>💬 Fair use</summary>

To ensure service availability, shared instance has a few limitations:
  * Images are cached for 1 hour
    * Rendered metrics **won't be updated** during this time window when queried
    * You can manually update rendering againg your metrics on [metrics.lecoq.io](https://metrics.lecoq.io)
  * There is a rate limiter enabled (it doesn't affect already cached metrics)
  * Several plugins may not be available

</details>
