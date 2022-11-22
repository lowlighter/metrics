<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🦑 Splatoon</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays your Splatoon 3 recent matches based on data fetched from Splatnet.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://www.nintendo.com">Nintendo</a> or <a href="https://splatoon.nintendo.com">Splatoon</a>.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
<p>This specific plugin is licensed under GPL-3.0 rather than MIT to comply with <a href="https://github.com/spacemeowx2/s3si.ts">spacemeowx2/s3si.ts</a> license.</p>
<p>Note that <em>Nintendo Switch Online</em> web tokens usage are not explicitly allowed by <em>Nintendo</em>, use at your own risk.</p>
</td></tr>
<tr><th>Authors</th><td><a href="https://github.com/lowlighter">@lowlighter</a></td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code></td>
  </tr>
  <tr>
    <td><code>🗝️ plugin_splatoon_token</code> <code>🗝️ plugin_splatoon_statink_token</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.splatoon.svg" alt=""></img>
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
    <td nowrap="nowrap"><h4><code>plugin_splatoon</code></h4></td>
    <td rowspan="2"><p>Enable splatoon plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_splatoon_token</code></h4></td>
    <td rowspan="2"><p>Splatnet token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
✨ On <code>master</code>/<code>main</code><br>
🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.api.nintendo.splatnet</i></li>
</ul>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_splatoon_modes</code></h4></td>
    <td rowspan="2"><p>Displayed modes</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> turf-war, splat-zones, tower-control, rainmaker, clam-blitz, salmon-run<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_splatoon_versus_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (Versus)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 6)</i>
<br>
<b>default:</b> 1<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_splatoon_salmon_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (Salmon run)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 6)</i>
<br>
<b>default:</b> 1<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_splatoon_statink</code></h4></td>
    <td rowspan="2"><p>stat.ink integration</p>
<p>If set, fetched data will also be uploaded to stat.ink
Requires <a href="/source/plugins/community/splatoon/README.md#plugin_splatoon_statink_token"><code>plugin_splatoon_statink_token</code></a> to be set</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.api.statink</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_splatoon_statink_token</code></h4></td>
    <td rowspan="2"><p>stat.ink token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
</table>
<!--/options-->

## 🗝️ Obtaining a *Nintendo Switch Online* token

The helper script is intended to be run by [deno runtime](https://deno.land/). Either [install it locally](https://deno.land/manual/getting_started/installation) or use its [docker image](https://hub.docker.com/r/denoland/deno).

Run the following command in your terminal and follow instructions:
```bash
deno run --allow-run=deno --allow-read=profile.json --allow-write=profile.json --unstable https://raw.githubusercontent.com/lowlighter/metrics/master/source/plugins/community/splatoon/token.ts
```

![Script](/.github/readme/imgs/plugin_splatoon_script.png)

![Authentication](/.github/readme/imgs/plugin_splatoon_auth.png)

## 🐙 [stat.ink](https://stat.ink) integration

It is possible to make this plugin automatically export fetched games to [stat.ink](https://stat.ink) by adding the following:

```yaml
plugin_splatoon_statink: yes
plugin_splatoon_statink_token: ${{ secrets.SPLATOON_STATINK_TOKEN }}
```

[stat.ink](https://stat.ink) API key can be found on user profile:

![stat.ink](/.github/readme/imgs/plugin_splatoon_statink.png)

## 👨‍💻 About

Data are fetched using [spacemeowx2/s3si.ts](https://github.com/spacemeowx2/s3si.ts) tool (which is itself based on [frozenpandaman/s3s](https://github.com/frozenpandaman/s3s)).

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Splatnet data
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.splatoon.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_splatoon: yes
  plugin_splatoon_token: ${{ secrets.SPLATOON_TOKEN }}

```
```yaml
name: Splatnet data with stat.ink integration
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.splatoon.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_splatoon: yes
  plugin_splatoon_token: ${{ secrets.SPLATOON_TOKEN }}
  plugin_splatoon_statink: yes
  plugin_splatoon_statink_token: ${{ secrets.SPLATOON_STATINK_TOKEN }}
  extras_css: |
    h2 { display: none !important; }

```
<!--/examples-->
