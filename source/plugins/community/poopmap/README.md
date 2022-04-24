<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>💩 PoopMap plugin</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays statistics from a <a href="https://poopmap.net">PoopMap</a> account.</p>
</td></tr>
<tr><th>Authors</th><td><a href="https://github.com/matievisthekat">@matievisthekat</a></td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code></td>
  </tr>
  <tr>
    <td><code>🗝️ plugin_poopmap_token</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/matievisthekat/matievisthekat/blob/master/metrics.plugin.poopmap.svg" alt=""></img>
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
    <td nowrap="nowrap"><h4><code>plugin_poopmap</code></h4></td>
    <td rowspan="2"><p>Enable poopmap plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_poopmap_token</code></h4></td>
    <td rowspan="2"><p>PoopMap API token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_poopmap_days</code></h4></td>
    <td rowspan="2"><p>Time range</p>
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

## 🗝️ Obtaining a PoopMap token

Install PoopMap app ([iOS](https://itunes.apple.com/us/app/poop-map/id1303269455?mt=8)/[Android](https://play.google.com/store/apps/details?id=net.poopmap)) and create an account.

Navigate to your profile in the app

<div align="center">
  <img src="https://user-images.githubusercontent.com/45036977/143533812-c2776bcc-1fda-441e-bc96-cf21d4c69ca1.jpg" width="150" />
</div>

Tap "Share Profile" in the top right

<div align="center">
  <img src="https://user-images.githubusercontent.com/45036977/143533849-b7e03b4d-2903-4339-bbb7-e1fc0ea9724e.jpg" width="150" />
</div>

Tap "Copy to Clipboard"

<div align="center">
  <img src="https://user-images.githubusercontent.com/45036977/143533856-f4a9fc0d-7bde-48c2-b579-e8ee91804d78.jpg" width="150" />
</div>

It should result in something like `Haha, check out the places I've pooped on Poop Map https://api.poopmap.net/map?token=xxxxxxxxxx` copied.

Extract the `token` query paramater from the link and use it in `plugin_poopmap_token`.
This token will not expire and it will be able to access only public details.

## ℹ️ Examples workflows

<!--examples-->
```yaml
uses: lowlighter/metrics@latest
with:
  token: NOT_NEEDED
  plugin_poopmap_token: ${{ secrets.POOPMAP_TOKEN }}
  plugin_poopmap: yes

```
<!--/examples-->
