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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@master
  with:
    # ... other options
    plugin_nightscout: yes
    plugin_nightscout_url: ${{ secrets.NIGHTSCOUT_URL }} # Use the github actions "NIGHTSCOUT_URL" secret as your nightscout site
    plugin_nightscout_datapoints: 12                     # Use the latest 12 blood sugar datapoints to create a graph
    plugin_nightscout_lowalert: 80                       # Blood sugars below 80 will be considered low
    plugin_nightscout_highalert: 180                     # Blood sugars above 180 will be considered high
    plugin_nightscout_urgentlowalert: 50                 # Blood sugars below 50 will be considered urgently low
    plugin_nightscout_urgenthighalert: 250               # Blood sugars above 250 will be considered urgently high
```