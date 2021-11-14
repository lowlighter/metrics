### 🐤 Tweets

The recent *tweets* plugin displays your latest tweets from your [Twitter](https://twitter.com) account.

<table>
  <td align="center">
    <details open><summary>Latest tweets</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.tweets.svg">
    </details>
    <details><summary>Latest tweets with attachments</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.tweets.attachments.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

<details>
<summary>💬 Obtaining a Twitter token</summary>

To get a Twitter token, you'll need to apply to the [developer program](https://apps.twitter.com).
It's a bit tedious, but it seems that requests are approved quite quickly.

Create an app from your [developer dashboard](https://developer.twitter.com/en/portal/dashboard) and register your bearer token in your repository secrets.

![Twitter token](/.github/readme/imgs/plugin_tweets_secrets.png)

</details>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_tweets: yes
    plugin_tweets_token: ${{ secrets.TWITTER_TOKEN }} # Required
    plugin_tweets_attachments: yes                    # Display tweets attachments (images, preview urls, etc.)
    plugin_tweets_limit: 2                            # Limit to 2 tweets
    plugin_tweets_user: .user.twitter                 # Defaults to your GitHub linked twitter username
```
