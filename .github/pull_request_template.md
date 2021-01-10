<!--

  👋 Hi there!
  Thanks for contributing to metrics and helping us to improve!

  Please check the following before opening a pull request:
    - It does not duplicate another existing pull request
    - It is not mentioned in https://github.com/lowlighter/metrics/projects/1
      - If it is, ensure that maintainers are aware that you're working on this subject

  Then, explain briefly what your pull request is about and link any related issues (if applicable) to help us keeping track.

  For documentation updates....
    - Check spelling before asking for a review
    - Respect current formatting (check that your editions blends well with current state)
    - Static images must be saved in /.github/readme/imgs and must be of width 1260px
      - UI should always be set in English in screenshots

  For new plugins...
    - Ensure that you created:
      - a plugin entrypoint named index.mjs in /source/plugins
      - tests in /tests/metrics.test.js
        - mocked data if needed (required for all APIs which requires a token or limited in requests)
    - Ensure you updated:
      - /source/app/action/index.mjs to support new plugin options and use correct typing
      - /source/web/statics/* to support new plugin options
      - /settings.example.json with new plugin name
      - README.md to explain new plugin features
    - Include a screenshot in your pull request description
      - You can use `&config.output=png` option in your web instance for it

  For all code editions...
    - Ensure retro-compatibility with previous versions (
        - (unless for unreleased features, for which breaking changes are allowed)
    - Respect current formatting
      - Prefers using appropriate single words for variables and plugins names
      - Avoid using uppercases letters, brackets and semicolons when possible to avoid visual pollution
      - Comments should be added before each "code paragraph" and are considered indent worthy

-->
