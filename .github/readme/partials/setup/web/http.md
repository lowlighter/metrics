<!-- <% if (false) { %> -->
#### 🔗 HTTP parameters
<!-- <% } %> -->

Most of options from [action.yml](/action.yml) are actually supported by web instance, though syntax is slightly different.
All underscores (`_`) must be replaced by dots (`.`) and `plugin_` prefixes must be dropped.

For example, to configure pagespeed plugin you'd use the following:
```
https://my-personal-domain.com/my-github-user?pagespeed=1&pagespeed.detailed=1&pagespeed.url=https%3A%2F%2Fexample.com
```

Note that url parameters must be [encoded](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/encodeURIComponent).

As for `base` content, which is enabled by default, sections are available through "`base.<section>`".

For example, to display only `repositories` section, use:
```
https://my-personal-domain.com/my-github-user?base=0&base.repositories=1
```