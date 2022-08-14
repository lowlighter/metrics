<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🌇 GitHub Skyline</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays the 3D commits calendar from <a href="https://skyline.github.com/">skyline.github.com</a>.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://github.com">GitHub</a>.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
</td></tr>
  <tr><th>ℹ Additional notes</th><td><blockquote>
<p>⚠️ This plugin significantly increase file size, consider using it as standalone.</p>
</blockquote>
</td></tr>
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
      <details open><summary>GitHub Skyline</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.skyline.svg" alt=""></img></details>
      <details><summary>GitHub City</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.skyline.city.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_skyline</code></h4></td>
    <td rowspan="2"><p>Enable skyline plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.cpu.overuse</i></li>
<li><i>metrics.npm.optional.gifencoder</i></li>
<li><i>metrics.run.puppeteer.scrapping</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_skyline_year</code></h4></td>
    <td rowspan="2"><p>Displayed year</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(2008 ≤
𝑥)</i>
<br>
<b>default:</b> current-year<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_skyline_frames</code></h4></td>
    <td rowspan="2"><p>Frames count</p>
<p>Use 120 for a full-loop and 60 for a half-loop.
A higher number of frames will increase file size.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 120)</i>
<br>
<b>default:</b> 60<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_skyline_quality</code></h4></td>
    <td rowspan="2"><p>Image quality</p>
<p>A higher image quality will increase file size.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0.1 ≤
𝑥
≤ 1)</i>
<br>
<b>default:</b> 0.5<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_skyline_compatibility</code></h4></td>
    <td rowspan="2"><p>Compatibility mode</p>
<p>This uses CSS animations rather than embedded GIF to support a wider range of browsers, like Firefox and Safari.
Using this mode significantly increase file size as each frame is encoded separately</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_skyline_settings</code></h4></td>
    <td rowspan="2"><p>Advanced settings</p>
<p>Can be configured to use alternate skyline websites different from <a href="https://skyline.github.com">skyline.github.com</a>, such as <a href="https://github.com/honzaap/GithubCity">honzaap&#39;s GitHub City</a>.</p>
<ul>
<li><code>url</code>: Target URL (mandatory)</li>
<li><code>ready</code>: Readiness condition (A JS function that returns a boolean)</li>
<li><code>wait</code>: Time to wait after readiness condition is met (in seconds)</li>
<li><code>hide</code>: HTML elements to hide (A CSS selector)</li>
</ul>
<p>For <code>url</code> and <code>ready</code> options, <code>${login}</code> and <code>${year}</code> will be respectively templated to user&#39;s login and specified year</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.run.puppeteer.user.js</i></li>
</ul>
<b>type:</b> <code>json</code>
<br>
<b>default:</b> <details><summary>→ Click to expand</summary><pre language="json"><code>{
  "url": "https://skyline.github.com/${login}/${year}",
  "ready": "[...document.querySelectorAll('span')].map(span => span.innerText).includes('Share on Twitter')",
  "wait": 1,
  "hide": "button, footer, a"
}
</code></pre></details><br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: GitHub Skyline
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.skyline.svg
  token: NOT_NEEDED
  base: ""
  plugin_skyline: yes
  plugin_skyline_year: 2020
  plugin_skyline_frames: 6
  plugin_skyline_quality: 1

```
```yaml
name: GitHub City
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.skyline.city.svg
  token: NOT_NEEDED
  base: ""
  plugin_skyline: yes
  plugin_skyline_year: 2020
  plugin_skyline_frames: 6
  plugin_skyline_quality: 1
  plugin_skyline_settings: |
    {
      "url": "https://honzaap.github.io/GithubCity?name=${login}&year=${year}",
      "ready": "[...document.querySelectorAll('.display-info span')].map(span => span.innerText).includes('${login}')",
      "wait": 4,
      "hide": ".github-corner, .footer-link, .buttons-options, .mobile-rotate, .display-info span:first-child"
    }

```
<!--/examples-->
