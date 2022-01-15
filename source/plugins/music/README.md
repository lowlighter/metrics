### 🎼 Music plugin

The *music* plugin lets you display :

<table>
  <td align="center">
    <details open><summary>Random tracks from a playlist</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.music.playlist.svg">
    </details>
    <details open><summary>Recently listened</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.music.recent.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

It can work in the following modes:

### Playlist mode

Select randomly a few tracks from a given playlist to share your favorites tracks with your visitors.

Select a music provider below for instructions.

<details>
<summary>Apple Music</summary>

Extract the *embed* URL of the playlist you want to share.

To do so, connect to [music.apple.com](https://music.apple.com/) and select the playlist you want to share.
From `...` menu, select `Share` and `Copy embed code`.

![Copy embed code of playlist](/.github/readme/imgs/plugin_music_playlist_apple.png)

Extract the source link from the code pasted in your clipboard:
```html
<iframe allow="" frameborder="" height="" style="" sandbox="" src="https://embed.music.apple.com/**/playlist/********"></iframe>
```

And use this value in `plugin_music_playlist` option.

</details>

<details>
<summary>Spotify</summary>

Extract the *embed* URL of the playlist you want to share.

To do so, Open Spotify and select the playlist you want to share.
From `...` menu, select `Share` and `Copy embed code`.

![Copy embed code of playlist](/.github/readme/imgs/plugin_music_playlist_spotify.png)

Extract the source link from the code pasted in your clipboard:
```html
<iframe src="https://open.spotify.com/embed/playlist/********" width="" height="" frameborder="0" allowtransparency="" allow=""></iframe>
```

And use this value in `plugin_music_playlist` option.

</details>

<details>
<summary>Last.fm</summary>

This mode is not supported for now.

</details>

<details>
<summary>YouTube Music</summary>

Extract the *playlist* URL of the playlist you want to share.

To do so, Open YouTube Music and select the playlist you want to share.

Extract the source link from copying it from the address bar:
```
https://music.youtube.com/playlist?list=********
```

And use this value in `plugin_music_playlist` option.

</details>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_music: yes
    plugin_music_limit: 4                   # Limit to 4 entries
    plugin_music_playlist: https://******** # Use extracted playlist link
    # plugin_music_provider: (will be guessed through plugin_music_playlist)
    # plugin_music_mode: (will be set to "playlist" when plugin_music_playlist is provided)
```

### Recently played & top modes

- **Recently played**: Display tracks you have played recently.
- **Top**: Display your top artists/tracks for a certain time period.

Select a music provider below for additional instructions.

<details>
<summary>Apple Music</summary>

This mode is not supported for now.

I tried to find a way with *smart playlists*, *shortcuts* and other stuff but could not figure a workaround to do it without paying the $99 fee for the developer program.

So unfortunately this isn't available for now.

</details>

<details>
<summary>Spotify</summary>

Spotify does not have *personal tokens*, so it makes the process a bit longer because you're required to follow the [authorization workflow](https://developer.spotify.com/documentation/general/guides/authorization-guide/)... Follow the instructions below for a  *TL;DR* to obtain a `refresh_token`.

Sign in to the [developer dashboard](https://developer.spotify.com/dashboard/) and create a new app.
Keep your `client_id` and `client_secret` and let this tab open for now.

![Add a redirect url](/.github/readme/imgs/plugin_music_recent_spotify_token_0.png)

Open the settings and add a new *Redirect url*. Normally it is used to setup callbacks for apps, but just put `https://localhost` instead (it is mandatory as per the [authorization guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/), even if not used).

Forge the authorization url with your `client_id` and the encoded `redirect_uri` you whitelisted, and access it from your browser:

```
https://accounts.spotify.com/authorize?client_id=********&response_type=code&scope=user-read-recently-played%20user-top-read&redirect_uri=https%3A%2F%2Flocalhost
```

When prompted, authorize your application.

![Authorize application](/.github/readme/imgs/plugin_music_recent_spotify_token_1.png)

Once redirected to `redirect_uri`, extract the generated authorization `code` from your url bar.

![Extract authorization code from url](/.github/readme/imgs/plugin_music_recent_spotify_token_2.png)

Go back to your developer dashboard tab, and open the web console of your browser to paste the following JavaScript code, with your own `client_id`, `client_secret`, authorization `code` and `redirect_uri`.

```js
(async () => {
  console.log(await (await fetch("https://accounts.spotify.com/api/token", {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({
      grant_type:"authorization_code",
      redirect_uri:"https://localhost",
      client_id:"********",
      client_secret:"********",
      code:"********",
    })
  })).json())
})()
```

It should return a JSON response with the following content:
```json
{
  "access_token":"********",
  "expires_in": 3600,
  "scope":"user-read-recently-played user-top-read",
  "token_type":"Bearer",
  "refresh_token":"********"
}
```

Register your `client_id`, `client_secret` and `refresh_token` in secrets to finish setup.

</details>

<details>
<summary>Last.fm</summary>

Obtain a Last.fm API key.

To do so, you can simply [create an API account](https://www.last.fm/api/account/create) or [use an existing one](https://www.last.fm/api/accounts).

Register your API key to finish setup.

</details>

<details>
<summary>YouTube Music</summary>

Extract your YouTube Music cookies.

To do so, open [YouTube Music](https://music.youtube.com) (whilst logged in) on any modern browser

Open the developer tools (Ctrl-Shift-I) and select the “Network” tab

![Open developer tools](/.github/readme/imgs/plugin_music_recent_youtube_cookie_1.png)

Find an authenticated POST request. The simplest way is to filter by /browse using the search bar of the developer tools. If you don’t see the request, try scrolling down a bit or clicking on the library button in the top bar.

Click on the Name of any matching request. In the “Headers” tab, scroll to the “Cookie” and copy this by right-clicking on it and selecting “Copy value”.

![Copy cookie value](/.github/readme/imgs/plugin_music_recent_youtube_cookie_2.png)

</details>

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_music</code></td>
    <td rowspan="2"><p>Display your music tracks</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_music_provider</code></td>
    <td rowspan="2"><p>Music provider</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>allowed values:</b><ul><li>apple</li><li>spotify</li><li>lastfm</li><li>youtube</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_music_token</code></td>
    <td rowspan="2"><p>Music provider personal token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_music_mode</code></td>
    <td rowspan="2"><p>Plugin mode</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>allowed values:</b><ul><li>playlist</li><li>recent</li><li>top</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_music_playlist</code></td>
    <td rowspan="2"><p>Embed playlist url</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_music_limit</code></td>
    <td rowspan="2"><p>Maximum number of tracks to display</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 100)</i>
<br>
<b>default:</b> 4<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_music_played_at</code></td>
    <td rowspan="2"><p>Display when the track was played</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_music_time_range</code></td>
    <td rowspan="2"><p>Time period for top mode</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> short<br>
<b>allowed values:</b><ul><li>short</li><li>medium</li><li>long</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_music_top_type</code></td>
    <td rowspan="2"><p>Whether to show tracks or artists in top mode</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> tracks<br>
<b>allowed values:</b><ul><li>tracks</li><li>artists</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_music_user</code></td>
    <td rowspan="2"><p>Music provider username</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User login</code><br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Apple Music - Random track from playlist
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.music.playlist.svg
  token: NOT_NEEDED
  base: ''
  plugin_music: 'yes'
  plugin_music_playlist: https://embed.music.apple.com/fr/playlist/usr-share/pl.u-V9D7m8Etjmjd0D
  plugin_music_limit: 2

```
```yaml
name: Spotify - Random track from playlist
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.music.playlist.spotify.svg
  token: NOT_NEEDED
  base: ''
  plugin_music: 'yes'
  plugin_music_playlist: https://open.spotify.com/embed/playlist/3nfA87oeJw4LFVcUDjRcqi

```
```yaml
name: Spotify - Recently listed
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.music.recent.svg
  token: NOT_NEEDED
  base: ''
  plugin_music: 'yes'
  plugin_music_provider: spotify
  plugin_music_mode: recent
  plugin_music_token: ${{ secrets.SPOTIFY_TOKENS }}
  plugin_music_limit: 2

```
```yaml
name: Spotify - Top tracks
uses: lowlighter/metrics@latest
with:
  token: NOT_NEEDED
  base: ''
  plugin_music: 'yes'
  plugin_music_mode: top
  plugin_music_provider: spotify
  plugin_music_token: ${{ secrets.SPOTIFY_TOKENS }}
  plugin_music_time_range: short
  plugin_music_top_type: tracks

```
```yaml
name: Spotify - Top artists
uses: lowlighter/metrics@latest
with:
  token: NOT_NEEDED
  base: ''
  plugin_music: 'yes'
  plugin_music_mode: top
  plugin_music_provider: spotify
  plugin_music_token: ${{ secrets.SPOTIFY_TOKENS }}
  plugin_music_time_range: long
  plugin_music_top_type: artists

```
```yaml
name: Youtube Music - Random track from playlist
uses: lowlighter/metrics@latest
with:
  token: NOT_NEEDED
  base: ''
  plugin_music: 'yes'
  plugin_music_playlist: >-
    https://music.youtube.com/playlist?list=OLAK5uy_kU_uxp9TUOl9zVdw77xith8o9AknVwz9U

```
```yaml
name: Youtube Music - Recently listed
uses: lowlighter/metrics@latest
with:
  token: NOT_NEEDED
  base: ''
  plugin_music_token: ${{ secrets.YOUTUBE_MUSIC_TOKENS }}
  plugin_music: 'yes'
  plugin_music_mode: recent
  plugin_music_provider: youtube

```
```yaml
name: Last.fm  - Recently listed
uses: lowlighter/metrics@latest
with:
  token: NOT_NEEDED
  base: ''
  plugin_music_token: ${{ secrets.LASTFM_TOKEN }}
  plugin_music: 'yes'
  plugin_music_provider: lastfm
  plugin_music_user: RJ

```
<!--/examples-->
