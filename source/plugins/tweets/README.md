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

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_tweets` | `boolean` **[no]** | Display recent tweets |
| `plugin_tweets_token` <sup>🔐</sup> | `token` **[]** | Twitter API token |
| `plugin_tweets_attachments` | `boolean` **[no]** | Display tweets attchments |
| `plugin_tweets_limit` | `number` **[2]** *{1 ≤ 𝑥 ≤ 10}* | Maximum number of tweets to display |
| `plugin_tweets_user` | `string` **[*→ User attached twitter*]** | Twitter username |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Latest tweets
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.tweets.svg
  token: NOT_NEEDED
  plugin_tweets: 'yes'
  plugin_tweets_token: ${{ secrets.TWITTER_TOKEN }}
  plugin_tweets_user: github

```
```yaml
name: Latest tweets including attachments
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.tweets.attachments.svg
  token: NOT_NEEDED
  plugin_tweets: 'yes'
  plugin_tweets_token: ${{ secrets.TWITTER_TOKEN }}
  plugin_tweets_attachments: 'yes'
  plugin_tweets_user: github

```
<!--/examples-->
