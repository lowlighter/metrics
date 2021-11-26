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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_poopmap: yes
    plugin_poopmap_token: ${{ secrets.POOPMAP_TOKEN }}      # Required
    plugin_poopmap_days: 7                                  # Display last week stats
```
