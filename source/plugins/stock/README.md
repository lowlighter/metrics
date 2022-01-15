### 💹 Stock prices

The *stock* plugin lets you display the stock market price of a given company.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.stock.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

<details>
<summary>💬 Obtaining a RapidAPI Yahoo Finance token</summary>

Create a [RapidAPI account](https://rapidapi.com) and subscribe to [Yahoo Finance API](https://rapidapi.com/apidojo/api/yahoo-finance1) to get a token.

![RapidAPI token](/.github/readme/imgs/plugin_stock_token.png)

</details>

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_stock</code></td>
    <td rowspan="2">Display stock prices of a given company<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_stock_token</code></td>
    <td rowspan="2">Yahoo Finance token<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_stock_symbol</code></td>
    <td rowspan="2">Company stock symbol<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_stock_duration</code></td>
    <td rowspan="2">Time range to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> 1d<br>
<b>allowed values:</b><ul><li>1d</li><li>5d</li><li>1mo</li><li>3mo</li><li>6mo</li><li>1y</li><li>2y</li><li>5y</li><li>10y</li><li>ytd</li><li>max</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_stock_interval</code></td>
    <td rowspan="2">Time intervals between records<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> 5m<br>
<b>allowed values:</b><ul><li>1m</li><li>2m</li><li>5m</li><li>15m</li><li>60m</li><li>1d</li></ul></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Stock prices from Tesla
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stock.svg
  token: NOT_NEEDED
  base: ''
  plugin_stock: 'yes'
  plugin_stock_token: ${{ secrets.STOCK_TOKEN }}
  plugin_stock_symbol: TSLA

```
<!--/examples-->