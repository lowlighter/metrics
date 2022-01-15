### 🐤 Tweets

The recent *tweets* plugin displays your latest tweets from your [Twitter](https://twitter.com) account.

<table>
  <td align="center">
    <details open><summary>Latest tweets</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.tweets.svg">
    </details>
    <details><summary>Latest tweets with attachments</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.tweets.attachments.svg">
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
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_tweets</code></td>
    <td rowspan="2"><p>Display recent tweets</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_tweets_token</code></td>
    <td rowspan="2"><p>Twitter API token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_tweets_attachments</code></td>
    <td rowspan="2"><p>Display tweets attchments</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_tweets_limit</code></td>
    <td rowspan="2"><p>Maximum number of tweets to display</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 10)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_tweets_user</code></td>
    <td rowspan="2"><p>Twitter username</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User attached twitter</code><br></td>
  </tr>
</table>
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
  base: ''
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
  base: ''
  plugin_tweets: 'yes'
  plugin_tweets_token: ${{ secrets.TWITTER_TOKEN }}
  plugin_tweets_attachments: 'yes'
  plugin_tweets_user: github

```
<!--/examples-->
