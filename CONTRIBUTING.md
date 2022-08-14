# 💪 Interested in contributing?

Nice! Please read the few sections below to understand how to implement new features.

## 👨‍💻 Extending *metrics*

Be sure to read [ARCHITECTURE.md](/ARCHITECTURE.md) first to understand how `metrics` is structured and to follow [`🔧 Local setup for development`](.github/readme/partials/documentation/setup/local.md) to get a working development environment!

Before working on something, ensure that it will not duplicate any active open pull requests (including drafts).

It is advised to open a [`💬 discussion`](https://github.com/lowlighter/metrics/discussions) first to gather feedback about new features.

> ⚠️ To avoid an ever-growing backlog, inactive pull requests will be closed after 3 weeks and locked after 5 weeks.

> 😅 Be positive! Even if your changes don't get merged in [lowlighter/metrics](https://github.com/lowlighter/metrics), please don't be too sad, you will always be able to run workflows directly from your fork!

## 🤝 Accepted contributions

The following contributions are accepted:
<table>
  <tr>
    <th>Section</th>
    <th>Changes</th>
    <th>Additions</th>
    <th>Notes</th>
  </tr>
  <tr>
    <td nowrap="nowrap">🧩 Plugins</td>
    <td>✔️</td>
    <td>✔️</td>
    <td>
      <ul>
        <li>New features for existing plugins are allowed but must be optional and backward compatible</li>
        <li>New community plugins are welcomed provided they're functional and not redundant with existing plugins</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td nowrap="nowrap">🖼️ Templates</td>
    <td>✓</td>
    <td>❌</td>
    <td>
      <ul>
        <li>Template changes are allowed with new features additions (but must remain consistent with current visuals)</li>
        <li>New templates should use <a href="https://github.com/lowlighter/metrics/blob/master/source/templates/community/README.md">📕 Community templates</a> instead</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td nowrap="nowrap">🪛 Presets</td>
    <td>✔️</td>
    <td>✔️</td>
    <td>
      <ul>
        <li>New presets are welcomed provided they're functional and not redundant with existing presets</li>
        <li>Note that presets are on <code><a href="https://github.com/lowlighter/metrics/tree/presets">@presets</a></code> branch</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td nowrap="nowrap">🧪 Tests</td>
    <td>✔️</td>
    <td>✔️</td>
    <td>
      <ul>
        <li>Everything that makes metrics more stable is welcomed!</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td nowrap="nowrap">🧱 Core</td>
    <td>✓</td>
    <td>❌</td>
    <td>
      <ul>
        <li>Core changes impact all rendering process and should be avoided unless necessary</li>
        <li>New dependencies should be avoided when possible</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td nowrap="nowrap">🗃️ Repository</td>
    <td>❌</td>
    <td>❌</td>
    <td>
      <ul>
        <li>Workflows, license, readmes, etc. usually don't need to be edited</li>
      </ul>
    </td>
  </tr>
</table>

**Legend**
* ✔️: Contributions welcomed!
* ✓: Contributions are welcomed, but must be discussed first
* ❌: Only maintainers can manage these files
