<!-- Header -->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🪙 Crypto</h3></th></tr>
  <tr><td colspan="2" align="center">
    <p>This plugin generates an SVG image containing crypto metrics from a given address. It uses the CoinGecko API to fetch crypto prices.</p>
    <p>For more information, check the <a href="https://www.coingecko.com/vi/api/documentation">CoinGecko API documentation</a>.</p>
  </td></tr>
  <tr><th>Authors</th><td><a href="https://github.com/dajneem23">@dajneem23</a></td></tr>
  <tr>
    <th rowspan="3">Supported Features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td>
      <ul>
        <li><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></li>
        <li><a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <ul>
        <li><code>👤 Users</code></li>
        <li><code>👥 Organizations</code></li>
        <li><code>📓 Repositories</code></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>🗝️ plugin_crypto</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://via.placeholder.com/468x60?text=No%20preview%20available" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!-- /Header -->

## ➡️ Available Options

<!-- Options -->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_crypto</code></h4></td>
    <td rowspan="2"><p>Enable crypto plugin</p><img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">Type: <code>boolean</code><br>Default: <code>no</code><br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_crypto_id</code></h4></td>
    <td rowspan="2"><p>Crypto id (from Coingecko)</p><img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">Type: <code>string</code><br>Default: ""<br>Example: bitcoin<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_crypto_vs_currency</code></h4></td>
    <td rowspan="2"><p>The target currency of market data (usd, eur, jpy, etc.)</p><img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">Type: <code>string</code><br>Default: "usd"<br>Example: "usd"<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_crypto_days</code></h4></td>
    <td rowspan="2"><p>Data up to number of days ago (eg. 1,14,30,max)</p><img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">Type: <code>string</code><br>Default: "1"<br>Example: 1<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_crypto_precision</code></h4></td>
    <td rowspan="2"><p>The number of decimal places to use</p><img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">Type: <code>number</code><br>Default: 2<br>Example: 2<br></td>
  </tr>
</table>
<!-- /Options -->

<!--examples-->
```yaml
name: Crypto Metrics
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.crypto.svg
  token: NOT_NEEDED
  base: ""
  plugin_crypto: yes
  plugin_crypto_id: bitcoin
  plugin_crypto_vs_currency: usd
  plugin_crypto_days: 1
  plugin_crypto_precision: 2

```
<!--/examples-->
