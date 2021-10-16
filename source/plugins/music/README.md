### 🎼 Music plugin

The *music* plugin lets you display :

<table>
  <td align="center">
    <details open><summary>🎼 Favorite tracks version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.music.playlist.svg">
    </details>
    <details open><summary>Recently listened version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.music.recent.svg">
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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_music: yes
    plugin_music_limit: 4                   # Limit to 4 entries
    plugin_music_playlist: https://******** # Use extracted playlist link
                                            #   (plugin_music_provider and plugin_music_mode will be set automatically)
```

### Recently played & top modes

Recently played: Display tracks you have played recently.

Top: Display your top artists/tracks for a certain time period.

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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

##### Recent

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_music: yes
    plugin_music_provider: spotify # Use Spotify as provider
    plugin_music_mode: recent      # Set plugin mode
    plugin_music_limit: 4          # Limit to 4 entries
    plugin_music_played_at: yes    # Show timestamp (for spotify only)
    plugin_music_token: "${{ secrets.SPOTIFY_CLIENT_ID }}, ${{ secrets.SPOTIFY_CLIENT_SECRET }}, ${{ secrets.SPOTIFY_REFRESH_TOKEN }}"
```

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_music: yes
    plugin_music_provider: lastfm  # Use Last.fm as provider
    plugin_music_mode: recent      # Set plugin mode
    plugin_music_limit: 4          # Limit to 4 entries
    plugin_music_user: .user.login # Use same username as GitHub login
    plugin_music_token: ${{ secrets.LASTFM_API_KEY }}

```

##### Top

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_music: yes
    plugin_music_provider: spotify # Use Spotify as provider
    plugin_music_mode: top         # Set plugin mode
    plugin_music_top_type: tracks  # Set type for "top" mode; either tracks or artists
    plugin_music_limit: 4          # Limit to 4 entries, maximum is 50 for "top" mode with spotify
    plugin_music_time_range: short # Set time range for "top" mode; either short (4 weeks), medium (6 months) or long (several years)
    plugin_music_token: "${{ secrets.SPOTIFY_CLIENT_ID }}, ${{ secrets.SPOTIFY_CLIENT_SECRET }}, ${{ secrets.SPOTIFY_REFRESH_TOKEN }}"
```

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_music: yes
    plugin_music_provider: lastfm  # Use Last.fm as provider
    plugin_music_mode: top         # Set plugin mode
    plugin_music_top_type: artists # Set type for "top" mode; either tracks or artists
    plugin_music_limit: 4          # Limit to 4 entries
    plugin_music_time_range: long  # Set time range for "top" mode; either short (4 weeks), medium (6 months) or long (several years)
    plugin_music_user: .user.login # Use same username as GitHub login
    plugin_music_token: ${{ secrets.LASTFM_API_KEY }}

```
