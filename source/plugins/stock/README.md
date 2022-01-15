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
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_stock` | `boolean` **[no]** | Display stock prices of a given company |
| `plugin_stock_token` <sup>🔐</sup> | `token` **[]** | Yahoo Finance token |
| `plugin_stock_symbol` | `string` **[]** | Company stock symbol |
| `plugin_stock_duration` | `string` **[1d]** *{"1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"}* | Time range to display |
| `plugin_stock_interval` | `string` **[5m]** *{"1m", "2m", "5m", "15m", "60m", "1d"}* | Time intervals between records |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
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