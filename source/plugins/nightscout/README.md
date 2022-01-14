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
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_nightscout` | `boolean` **[no]** | Displays Blood Glucose |
| `plugin_nightscout_url` | `string` **[https://example.herokuapp.com]** | Your Nightscout site URL |
| `plugin_nightscout_datapoints` | `number` **[12]** *{0 ≤ 𝑥}* | How many datapoints to show on the graph. 0 and 1 disable the graph. |
| `plugin_nightscout_lowalert` | `number` **[80]** *{0 ≤ 𝑥}* | When the blood sugar is considered low |
| `plugin_nightscout_highalert` | `number` **[180]** *{0 ≤ 𝑥}* | When the blood sugar is considered high |
| `plugin_nightscout_urgentlowalert` | `number` **[50]** *{0 ≤ 𝑥}* | When the blood sugar is considered urgently low |
| `plugin_nightscout_urgenthighalert` | `number` **[250]** *{0 ≤ 𝑥}* | When the blood sugar is considered urgently high |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
uses: lowlighter/metrics@latest
with:
  plugin_nightscout: 'yes'
  plugin_nightscout_url: ${{ secrets.NIGHTSCOUT_URL }}

```
<!--/examples-->