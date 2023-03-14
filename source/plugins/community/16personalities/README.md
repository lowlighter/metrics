<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🧠 16personalities</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays personality profile from a <a href="https://www.16personalities.com/profile">16personalities profile</a>.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://www.16personalities.com">16personalities</a>.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
</td></tr>
<tr><th>Authors</th><td><a href="https://github.com/lowlighter">@lowlighter</a></td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code></td>
  </tr>
  <tr>
    <td><i>No tokens are required for this plugin</i></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.16personalities.svg" alt=""></img>
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
    <td nowrap="nowrap"><h4><code>plugin_16personalities</code></h4></td>
    <td rowspan="2"><p>Enable 16personalities plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.run.puppeteer.scrapping</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_16personalities_url</code></h4></td>
    <td rowspan="2"><p>Profile URL</p>
<p>This can be obtained after doing the <a href="https://www.16personalities.com/free-personality-test">test on 16personalities</a> and registering an email.
Login with the generated password received in your mailbox and copy the link that is displayed when sharing the profile.</p>
<img src="/.github/readme/imgs/plugin_16personalities_profile.png" width="800" />
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_16personalities_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>personality</code> will display personality type</li>
<li><code>profile</code> will display role and strategy</li>
<li><code>traits</code> will display mind, energy, nature, tactics and identity traits</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> personality<br>
<b>allowed values:</b><ul><li>personality</li><li>profile</li><li>traits</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_16personalities_scores</code></h4></td>
    <td rowspan="2"><p>Display traits scores</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: MBTI Personality profile
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.16personalities.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_16personalities: yes
  plugin_16personalities_url: ${{ secrets.SIXTEEN_PERSONALITIES_URL }}
  plugin_16personalities_sections: personality, traits
  plugin_16personalities_scores: no

```
<!--/examples-->
