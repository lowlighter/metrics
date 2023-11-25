---
title: About `.legacy` plugin
---

The `.legacy` plugin can be used to execute plugins within a _metrics_ v3.x context or to run plugins that are not yet available in v4.x.

It works by pulling the corresponding [docker](https://www.docker.com) image from [ghcr.io](https://github.com/lowlighter/metrics/pkgs/container/metrics) and running the container with the specified
inputs.

```yml
plugins:
  - .legacy:
      version: v3.34
      inputs:
        plugin_isocalendar: yes
        plugin_isocalendar_duration: full-year
```

For supported inputs, please refer to the `action.yml` of the chosen docker image version.

Note that some `🧱 Core` options are hardcoded or ignored for the purpose of this plugin (mainly options related to `config_output` and `output_action`, which are expected to be handled in the v4.x
context using processors).
