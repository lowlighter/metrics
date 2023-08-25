# 📒 Markdown template example

See [rendering of this file here](https://github.com/lowlighter/metrics/blob/examples/metrics.markdown.full.md) and [original template source here](https://github.com/lowlighter/metrics/blob/master/source/templates/markdown/example.md).

## 🧩 Plugins with markdown version

<%- await include(`partials/activity.ejs`) %>

___

<%- await include(`partials/posts.ejs`) %>

___

<%- await include(`partials/rss.ejs`) %>

___

> ⚠️ As [Twitter](https://twitter.com) removed the ability to fetch tweets from their free API as part of their new [pricing policy](https://developer.twitter.com/en/docs/twitter-api/getting-started/about-twitter-api), this plugin is no longer maintained.

<!-- <% if (false) { %> -->
<<!-- -->%- await include(`partials/tweets.ejs`) %<!-- -->>
<!-- <% } %> -->
<!-- Example rendering before the plugin was deprecated
<%- "--"+">" %>

**[🐤 Latest tweets from @github](https://twitter.com/github)**
> Putting that extra “+” in engineering culture, staff+ engineers lead by example, collaborate, make effective decisions, and support organizational goals. <span class="mention">@rynchantress</span> breaks it down.
>
> <a href="GitHub"><img src="https://images.ctfassets.net/s5uo95nf6njh/3sBQCkU6O0Lwc2Tp2LkMrU/e20b22c6ecaa66be267ebdf2d7774816/1920x1080-ReadMe-Site_Hero-Ryn_Daniels.jpg" alt="How to put the plus in ‘staff+’ engineer " height="200"></a>
>
> *19:22:01 on 6 Jun 2023*

> It's never been more essential to ensure that your mobile applications are secure. 🔒 Check out two highlights from code scanning and Dependabot that are bringing a heightened level of security to the mobile development process in both Swift and Kotlin.
>
> <a href="The GitHub Blog"><img src="https://github.blog/wp-content/uploads/2023/05/1200.630-Security-wLogo.png" alt="Swift support brings broader mobile application security to GitHub Advanced Security | The GitHub Blog" height="200"></a>
>
> *16:48:16 on 6 Jun 2023*

<%- "<"+"!--" %>
-->

___

<%- await include(`partials/topics.ejs`) %>

## 🎈 Embedding SVG metrics on-the-fly

<%- await embed(`example-isocalendar`, {isocalendar:true, isocalendar_duration:"full-year", config_display:"large"}) %>

___

<%- await embed(`example-languages-pdf`, {languages:true, languages_details:"percentage, bytes-size", config_display:"large"}) %>

___

<%- await embed(`example-base-pdf`, {base:"activity, community, repositories"}) %>
