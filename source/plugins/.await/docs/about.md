---
title: About `.await` plugin
---

The _metrics_ engine executes plugins in parallel to speed up response times, but sometimes it is required to wait for results collection before continuing.

The `.await` meta-plugin acts as a synchronization barrier.

It is especially useful when performing group operations such as rendering, transformations, publications, etc. which is why it's usually used in conjunction with processors.

```yml
plugins:
  # Plugins "a" and "b" are executed in parallel
  - a:
  - b:
  # ".await" for previous plugins to be completed
  - .await:
    processors:
      - render.content:
      - publish.console:
```

Note that `.await` plugin is actually implicit when no plugin identifier is specified.

```yml
plugins:
  # ".await" is implicit
  - processors:
      - render.content:
      - publish.console:
```
