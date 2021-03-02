## 💕 Using the shared instance (~1 min setup, but with limitations)

For convenience, you can use the shared instance available at [metrics.lecoq.io](https://metrics.lecoq.io) without any additional setup.

```markdown
![Metrics](https://metrics.lecoq.io/my-github-user)
```

This is mostly intended for previews, to enjoy all features consider using GitHub Action instead.

<details>
<summary><b>💬 Fair use</b> <i>(click to expand)</i></summary>

To ensure service availability, shared instance has a few limitations:
  * Images are cached for 15 minutes
    * Rendered metrics **won't be updated** during this time window when queried
    * You can manually update rendering againg your metrics on [metrics.lecoq.io](https://metrics.lecoq.io)
  * A rate limiter is enabled to prevent denial of service (it doesn't affect already cached metrics)
  * Some plugins may not be available

Service is provided free of charge, so please be gentle with it 🙂

</details>
