### 💉 Nightscout

The *Nightscout* plugin lets you display blood sugar values from a [Nightscout](http://nightscout.info) site.

<table>
  <td align="center">
    <img src="https://github.com/legoandmars/legoandmars/blob/master/metrics.plugin.nightscout.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

<details>
<summary>💬 Setting up a nightscout site</summary>

The [nightscout website](http://www.nightscout.info/) details how to self-host a nightscout site. Check out the instructions there.

</details>

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_nightscout</code></td>
    <td rowspan="2">Displays Blood Glucose<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_nightscout_url</code></td>
    <td rowspan="2">Your Nightscout site URL<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> https://example.herokuapp.com<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_nightscout_datapoints</code></td>
    <td rowspan="2">How many datapoints to show on the graph. 0 and 1 disable the graph.<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 12<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_nightscout_lowalert</code></td>
    <td rowspan="2">When the blood sugar is considered low<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 80<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_nightscout_highalert</code></td>
    <td rowspan="2">When the blood sugar is considered high<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 180<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_nightscout_urgentlowalert</code></td>
    <td rowspan="2">When the blood sugar is considered urgently low<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 50<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_nightscout_urgenthighalert</code></td>
    <td rowspan="2">When the blood sugar is considered urgently high<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 250<br></td>
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
  plugin_nightscout: 'yes'
  plugin_nightscout_url: ${{ secrets.NIGHTSCOUT_URL }}

```
<!--/examples-->