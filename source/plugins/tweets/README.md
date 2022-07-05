<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🐤 Latest tweets</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays the latest tweets from a <a href="https://twitter.com">Twitter</a> account.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/markdown/README.md"><code>📒 Markdown template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code></td>
  </tr>
  <tr>
    <td><code>🗝️ plugin_tweets_token</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Latest tweets with attachments</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.tweets.attachments.svg" alt=""></img></details>
      <details><summary>Latest tweets</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.tweets.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_tweets</code></h4></td>
    <td rowspan="2"><p>Enable tweets plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_tweets_token</code></h4></td>
    <td rowspan="2"><p>Twitter API token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_tweets_user</code></h4></td>
    <td rowspan="2"><p>Twitter username</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User attached twitter</code><br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_tweets_attachments</code></h4></td>
    <td rowspan="2"><p>Tweets attachments</p>
<p>Can be used to display linked images, video thumbnails, etc.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_tweets_limit</code></h4></td>
    <td rowspan="2"><p>Display limit</p>
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
</table>
<!--/options-->

## 🗝️ Obtaining a Twitter token

To get a Twitter token, it is required to apply to the [developer program](https://apps.twitter.com).
It's a bit tedious, but requests seems to be approved quite quickly.

Create an app from the [developer dashboard](https://developer.twitter.com/en/portal/dashboard) and register your bearer token in repository secrets.

![Twitter token](/.github/readme/imgs/plugin_tweets_secrets.png)

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Latest tweets
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.tweets.svg
  token: NOT_NEEDED
  base: ""
  plugin_tweets: yes
  plugin_tweets_token: ${{ secrets.TWITTER_TOKEN }}
  plugin_tweets_user: github

```
```yaml
name: Latest tweets including attachments
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.tweets.attachments.svg
  token: NOT_NEEDED
  base: ""
  plugin_tweets: yes
  plugin_tweets_token: ${{ secrets.TWITTER_TOKEN }}
  plugin_tweets_attachments: yes
  plugin_tweets_user: github
  plugin_tweets_limit: 1

```
<!--/examples-->
