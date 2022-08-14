<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🎼 Music activity and suggestions</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin can display top and recently listened music tracks or titles from a random playlist.</p>
<p>Different music providers are supported.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with any of the supported provider.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code></td>
  </tr>
  <tr>
    <td><code>🗝️ plugin_music_token</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Random tracks from a playlist</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.music.playlist.svg" alt=""></img></details>
      <details open><summary>Recently listened</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.music.recent.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_music</code></h4></td>
    <td rowspan="2"><p>Enable music plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.run.puppeteer.scrapping</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_music_provider</code></h4></td>
    <td rowspan="2"><p>Music provider</p>
<ul>
<li><code>apple</code>: Apple Music</li>
<li><code>spotify</code>: Spotify</li>
<li><code>lastfm</code>: Last.fm</li>
<li><code>youtube</code>: YouTube Music</li>
</ul>
<p>This setting is optional when using <a href="/source/plugins/music/README.md#plugin_music_mode"><code>plugin_music_mode: playlist</code></a> (provider will be auto-detected from <a href="/source/plugins/music/README.md#plugin_music_playlist"><code>plugin_music_playlist</code></a> URL)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>allowed values:</b><ul><li>apple</li><li>spotify</li><li>lastfm</li><li>youtube</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_music_token</code></h4></td>
    <td rowspan="2"><p>Music provider token</p>
<p>Below is the expected token format for each provider:</p>
<ul>
<li><code>apple</code>: <em>(not supported)</em></li>
<li><code>spotify</code>: &quot;client_id, client_secret, refresh_token&quot;</li>
<li><code>lastfm</code>: &quot;api_key&quot;</li>
<li><code>youtube</code>: &quot;cookie&quot;</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.api.music.any</i></li>
</ul>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_music_user</code></h4></td>
    <td rowspan="2"><p>Music provider username</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User login</code><br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_music_mode</code></h4></td>
    <td rowspan="2"><p>Display mode</p>
<ul>
<li><code>playlist</code>: display random tracks from an URL playlist</li>
<li><code>recent</code>: display recently listened tracks</li>
<li><code>top</code>: display top listened artists/tracks</li>
</ul>
<p>If <a href="/source/plugins/music/README.md#plugin_music_playlist"><code>plugin_music_playlist</code></a> is specified, the default value is <code>playlist</code>, else it is <code>recent</code></p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>allowed values:</b><ul><li>playlist</li><li>recent</li><li>top</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_music_playlist</code></h4></td>
    <td rowspan="2"><p>Playlist URL</p>
<p>It must be from an &quot;embed url&quot; (i.e. music player iframes that can be integrated in other websites)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_music_limit</code></h4></td>
    <td rowspan="2"><p>Display limit</p>
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
    <td nowrap="nowrap"><h4><code>plugin_music_played_at</code></h4></td>
    <td rowspan="2"><p>Recently played - Last played timestamp</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_music_time_range</code></h4></td>
    <td rowspan="2"><p>Top tracks - Time range</p>
<ul>
<li><code>short</code>: 4 weeks</li>
<li><code>medium</code>: 6 months</li>
<li><code>long</code>: several years</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> short<br>
<b>allowed values:</b><ul><li>short</li><li>medium</li><li>long</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_music_top_type</code></h4></td>
    <td rowspan="2"><p>Top tracks - Display type</p>
<ul>
<li><code>tracks</code>: display track</li>
<li><code>artists</code>: display artists</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> tracks<br>
<b>allowed values:</b><ul><li>tracks</li><li>artists</li></ul></td>
  </tr>
</table>
<!--/options-->

## 🎺 Configuring music provider

Select a music provider below for additional instructions.

## 🎙️ Spotify

### 🗝️ Obtaining a token

Spotify does not have *personal tokens*, so it makes the process a bit longer because it is required to follow the [authorization workflow](https://developer.spotify.com/documentation/general/guides/authorization-guide/)... Follow the instructions below for a *TL;DR* to obtain a `refresh_token`.

Sign in to the [developer dashboard](https://developer.spotify.com/dashboard/) and create a new app.
Keep your `client_id` and `client_secret` and let this tab open for now.

![Add a redirect url](/.github/readme/imgs/plugin_music_recent_spotify_token_0.png)

Open the settings and add a new *Redirect url*. Normally it is used to setup callbacks for apps, but just put `https://localhost` instead (it is mandatory as per the [authorization guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/), even if not used).

Forge the authorization url with your `client_id` and the encoded `redirect_uri` you whitelisted, and access it from your browser:

```
https://accounts.spotify.com/authorize?client_id=********&response_type=code&scope=user-read-recently-played%20user-top-read&redirect_uri=https%3A%2F%2Flocalhost
```

When prompted, authorize application.

![Authorize application](/.github/readme/imgs/plugin_music_recent_spotify_token_1.png)

Once redirected to `redirect_uri`, extract the generated authorization `code` from your url bar.

![Extract authorization code from url](/.github/readme/imgs/plugin_music_recent_spotify_token_2.png)

Go back to developer dashboard tab, and open the web console of your browser to paste the following JavaScript code, with your own `client_id`, `client_secret`, authorization `code` and `redirect_uri`.

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

### 🔗 Get an embed playlist url for `plugin_music_playlist`

Connect to [spotify.com](https://www.spotify.com) and select the playlist you want to share.
From `...` menu, select `Share` and `Copy embed code`.

![Copy embed code of playlist](/.github/readme/imgs/plugin_music_playlist_spotify.png)

Extract the source link from the code pasted in your clipboard:
```html
<iframe src="https://open.spotify.com/embed/playlist/********" width="" height="" frameborder="0" allowtransparency="" allow=""></iframe>
```

## 🍎 Apple Music

### 🗝️ Obtaining a token

*(Not available)*

> 😥 Unfortunately I wasn't able to find a workaround to avoid paying the $99 fee for the developer program, even using workarounds like *smart playlists*, *shortcuts* and other stuff. However if you really want this feature, you could [sponsor me](github.com/sponsors/lowlighter) and I could eventually invest in a developer account with enough money, implement it and also eventually offer service on the shared instance

### 🔗 Get an embed playlist url for `plugin_music_playlist`

Connect to [music.apple.com](https://music.apple.com/) and select the playlist you want to share.
From `...` menu, select `Share` and `Copy embed code`.

![Copy embed code of playlist](/.github/readme/imgs/plugin_music_playlist_apple.png)

Extract the source link from the code pasted in your clipboard:
```html
<iframe allow="" frameborder="" height="" style="" sandbox="" src="https://embed.music.apple.com/**/playlist/********"></iframe>
```

## ⏯️ Youtube Music

### 🗝️ Obtaining a token

Login to [YouTube Music](https://music.youtube.com) on any modern browser.

Open the developer tools (Ctrl-Shift-I) and select the “Network” tab

![Open developer tools](/.github/readme/imgs/plugin_music_recent_youtube_cookie_1.png)

Find an authenticated POST request. The simplest way is to filter by /browse using the search bar of the developer tools. If you don’t see the request, try scrolling down a bit or clicking on the library button in the top bar.

Click on the Name of any matching request. In the “Headers” tab, scroll to the “Cookie” and copy this by right-clicking on it and selecting “Copy value”.

![Copy cookie value](/.github/readme/imgs/plugin_music_recent_youtube_cookie_2.png)

### 🔗 Get an embed playlist url for `plugin_music_playlist`

Extract the *playlist* URL of the playlist you want to share.

Connect to [music.youtube.com](https://music.youtube.com) and select the playlist you want to share.

Extract the source link from the code pasted in your clipboard:
```
https://music.youtube.com/playlist?list=********
```

## 📻 Last.fm

### 🗝️ Obtaining a token

[Create an API account](https://www.last.fm/api/account/create) or [use an existing one](https://www.last.fm/api/accounts) to obtain a Last.fm API key.

### 🔗 Get an embed playlist url for `plugin_music_playlist`

*(Not available)*

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Apple Music - Random track from playlist
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.music.playlist.svg
  token: NOT_NEEDED
  base: ""
  plugin_music: yes
  plugin_music_playlist: https://embed.music.apple.com/fr/playlist/usr-share/pl.u-V9D7m8Etjmjd0D
  plugin_music_limit: 2

```
```yaml
name: Spotify - Random track from playlist
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.music.playlist.spotify.svg
  token: NOT_NEEDED
  base: ""
  plugin_music: yes
  plugin_music_playlist: https://open.spotify.com/embed/playlist/3nfA87oeJw4LFVcUDjRcqi

```
```yaml
name: Spotify - Recently listed
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.music.recent.svg
  token: NOT_NEEDED
  base: ""
  plugin_music: yes
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
  base: ""
  plugin_music: yes
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
  base: ""
  plugin_music: yes
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
  base: ""
  plugin_music: yes
  plugin_music_playlist: >-
    https://music.youtube.com/playlist?list=OLAK5uy_kU_uxp9TUOl9zVdw77xith8o9AknVwz9U

```
```yaml
name: Youtube Music - Recently listed
uses: lowlighter/metrics@latest
with:
  token: NOT_NEEDED
  base: ""
  plugin_music_token: ${{ secrets.YOUTUBE_MUSIC_TOKENS }}
  plugin_music: yes
  plugin_music_mode: recent
  plugin_music_provider: youtube

```
```yaml
name: Last.fm  - Recently listed
uses: lowlighter/metrics@latest
with:
  token: NOT_NEEDED
  base: ""
  plugin_music_token: ${{ secrets.LASTFM_TOKEN }}
  plugin_music: yes
  plugin_music_provider: lastfm
  plugin_music_user: RJ

```
<!--/examples-->
