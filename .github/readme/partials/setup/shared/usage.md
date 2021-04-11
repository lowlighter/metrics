<!-- <% if (false) { %> -->
#### 💬 Fair use
<!-- <% } %> -->

To ensure service availability, shared instance has a few limitations:
  * Images are cached for 1 hour
    * Rendered metrics **won't be updated** during this time window when queried
    * You can manually update rendering again your metrics on [metrics.lecoq.io](https://metrics.lecoq.io)
  * A rate limiter is enabled to prevent denial of service (it doesn't affect already cached metrics)
  * Some plugins may not be available

Service is provided free of charge, so please be gentle with it 🙂