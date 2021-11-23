### 💩 PoopMap plugin

The *poopmap* plugin displays statistics from your [PoopMap](https://poopmap.net) account

<table>
  <td align="center">
    <img src="">
    <img width="900" height="1" alt="">
  </td>
</table>

<details>
  <summary>💬 Obtaining a PoopMap token</summary>

First, install the PoopMap app ([iOS](https://itunes.apple.com/us/app/poop-map/id1303269455?mt=8)/[Android](https://play.google.com/store/apps/details?id=net.poopmap)) and create an account.

Navigate to your profile in the app

<div align="center">
  <img src="https://i.imgur.com/TyXKzIR.jpg" width="150" />
</div>

Tap "Share Profile" in the top right

<div align="center">
  <img src="https://i.imgur.com/rWcNJaH.jpg" width="150" />
</div>

Tap "Copy to Clipboard" the copy the link to your clipboard

<div align="center">
  <img src="https://i.imgur.com/CctdShL.jpg" width="150" />
</div>

You should have something like
```
Haha, check out the places I've pooped on Poop Map https://api.poopmap.net/map?token=75f9b1f1af8372b8b991fb4e597db5f3
```
copied.

Extract the `token` query paramater from the link. For example mine is: `75f9b1f1af8372b8b991fb4e597db5f3`

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
    plugin_poopmap_sections: hours                          # Display poops per hours of a day graph
```