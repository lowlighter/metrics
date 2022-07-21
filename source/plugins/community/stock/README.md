<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>💹 Stock prices</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays the stock market price of a given company.</p>
</td></tr>
<tr><th>Authors</th><td><a href="https://github.com/lowlighter">@lowlighter</a></td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🗝️ plugin_stock_token</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.stock.svg" alt=""></img>
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
    <td nowrap="nowrap"><h4><code>plugin_stock</code></h4></td>
    <td rowspan="2"><p>Enable stock plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.npm.optional.chartist</i></li>
<li><i>metrics.api.yahoo.finance</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stock_token</code></h4></td>
    <td rowspan="2"><p>Yahoo Finance token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stock_symbol</code></h4></td>
    <td rowspan="2"><p>Company stock symbol</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stock_duration</code></h4></td>
    <td rowspan="2"><p>Time range</p>
<ul>
<li><code>1d</code>: Today</li>
<li><code>5d</code>: 5 days</li>
<li><code>1mo</code>: 1 month</li>
<li><code>3mo</code>: 3 months</li>
<li><code>6mo</code>: 6 months</li>
<li><code>1y</code>: 1 year</li>
<li><code>2y</code>: 2 years</li>
<li><code>5y</code>: 5 years</li>
<li><code>10y</code>: 10 years</li>
<li><code>ytd</code>: Year to date</li>
<li><code>max</code>: All time</li>
</ul>
<p>This is relative to current date</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> 1d<br>
<b>allowed values:</b><ul><li>1d</li><li>5d</li><li>1mo</li><li>3mo</li><li>6mo</li><li>1y</li><li>2y</li><li>5y</li><li>10y</li><li>ytd</li><li>max</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stock_interval</code></h4></td>
    <td rowspan="2"><p>Time interval between points</p>
<ul>
<li><code>1m</code>: 1 minute</li>
<li><code>2m</code>: 2 minutes</li>
<li><code>5m</code>: 5 minutes</li>
<li><code>15m</code>: 15 minutes</li>
<li><code>60m</code>: 60 minutes</li>
<li><code>1d</code>: 1 day</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> 5m<br>
<b>allowed values:</b><ul><li>1m</li><li>2m</li><li>5m</li><li>15m</li><li>60m</li><li>1d</li></ul></td>
  </tr>
</table>
<!--/options-->

## 🗝️ Obtaining a RapidAPI Yahoo Finance token

Create a [RapidAPI account](https://rapidapi.com) and subscribe to [Yahoo Finance API](https://rapidapi.com/apidojo/api/yahoo-finance1) to get a token.

![RapidAPI token](/.github/readme/imgs/plugin_stock_token.png)

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Stock prices from Tesla
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stock.svg
  token: NOT_NEEDED
  base: ""
  plugin_stock: yes
  plugin_stock_token: ${{ secrets.STOCK_TOKEN }}
  plugin_stock_symbol: TSLA

```
<!--/examples-->
