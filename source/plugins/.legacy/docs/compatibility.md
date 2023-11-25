---
title: About compatibility layer
---

For convenience, _metrics_ v4.x provides a compatibility layer to automatically transpile v3.x configurations to v4.x. Messages will be displayed in the console to indicate which changes were applied,
and to ease migration towards v4.x. at some point.

```yml
# v3.x configuration
inputs:
  base: ""
  token: github_token
  plugin_isocalendar: yes
  plugin_isocalendar_duration: full-year
  output_action: commit
  committer_branch: metrics-renders
```

```yml
# v4.x configuration
presets:
  default:
    plugins:
      token: github_token
plugins:
  - calendar:
      view: isometric
      range: last-365-days
  - processors:
      - render.content:
          format: svg
  - publish.git:
      commit:
        filepath: github-metrics.*
        message: Update ${file} - [Skip GitHub Action]
        branch: metrics-renders
```

> ⚠️ Note that the compatibility layer is trying its best to minimize changes, but the resulting configuration may still require some manual adjustments and may be more verbose than required.
