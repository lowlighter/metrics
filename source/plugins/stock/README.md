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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_stock: yes
    plugin_stock_token: ${{ secrets.STOCK_TOKEN }} # RapidAPI Yahoo Finance token
    plugin_stock_symbol: TSLA                      # Display Tesla stock price
    plugin_stock_duration: 1d                      # Display last day of market
    plugin_stock_interval: 5m                      # Use precision of 5 minutes for each record
```