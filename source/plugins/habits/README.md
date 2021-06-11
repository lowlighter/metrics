### 💡 Coding habits

The coding *habits* plugin display metrics based on your recent activity, such as active hours or languages recently used.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.habits.facts.svg">
    <details open><summary>Charts version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.habits.charts.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

Using more events will improve accuracy of these metrics, although it'll increase the number of GitHub requests used.

Active hours and days are computed through your commit history, while indent style is deduced from your recent diffs.
Recent languages activity is also computed from your recent diffs, using [github/linguist](https://github.com/github/linguist).

Use a full `repo` scope token to access **private** events.

By default, dates use Greenwich meridian (GMT/UTC). Be sure to set your timezone (see [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for a list of supported timezones) for accurate metrics.

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_habits: yes
    plugin_habits_from: 200       # Use 200 events to compute habits
    plugin_habits_days: 14        # Keep only events from last 14 days
    plugin_habits_facts: yes      # Display facts section
    plugin_habits_charts: yes     # Display charts section
    plugin_habits_trim: yes       # Trim unused hours on daily chart
    config_timezone: Europe/Paris # Set timezone
```
