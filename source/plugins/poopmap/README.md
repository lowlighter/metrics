### 💩 PoopMap plugin

The *poopmap* plugin displays statistics from your [PoopMap](https://poopmap.net) account

<table>
  <td align="center">
    <img src="https://github.com/matievisthekat/matievisthekat/blob/master/metrics.plugin.poopmap.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

<details>
  <summary>💬 Obtaining a PoopMap token</summary>

First, install the PoopMap app ([iOS](https://itunes.apple.com/us/app/poop-map/id1303269455?mt=8)/[Android](https://play.google.com/store/apps/details?id=net.poopmap)) and create an account.

Navigate to your profile in the app

<div align="center">
  <img src="https://user-images.githubusercontent.com/45036977/143533812-c2776bcc-1fda-441e-bc96-cf21d4c69ca1.jpg" width="150" />
</div>

Tap "Share Profile" in the top right

<div align="center">
  <img src="https://user-images.githubusercontent.com/45036977/143533849-b7e03b4d-2903-4339-bbb7-e1fc0ea9724e.jpg" width="150" />
</div>

Tap "Copy to Clipboard" the copy the link to your clipboard

<div align="center">
  <img src="https://user-images.githubusercontent.com/45036977/143533856-f4a9fc0d-7bde-48c2-b579-e8ee91804d78.jpg" width="150" />
</div>

You should have something like `Haha, check out the places I've pooped on Poop Map https://api.poopmap.net/map?token=xxxxxxxxxx` copied.

Extract the `token` query paramater from the link

You now have your PoopMap token! This token will not expire and it can only access public details.
</details>

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_poopmap</code></td>
    <td rowspan="2"><p>Display PoopMap stats</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_poopmap_token</code></td>
    <td rowspan="2"><p>PoopMap API token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_poopmap_days</code></td>
    <td rowspan="2"><p>PoopMap time range</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<br>
<b>default:</b> 7<br>
<b>allowed values:</b><ul><li>7</li><li>30</li><li>180</li><li>365</li></ul></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
uses: lowlighter/metrics@latest
with:
  token: ${{ secrets.METRICS_TOKEN }}
  plugin_poopmap: 'yes'

```
<!--/examples-->