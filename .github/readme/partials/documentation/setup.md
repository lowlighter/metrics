## 🦮 Setup

There are several ways to setup metrics, each having its advantages and disadvantages:

* [⚙️ Using GitHub Action on a profile repository *(~10 min)*](/.github/readme/partials/documentation/setup/action.md)
  * ✔️ All features
  * ✔️ High availability (no downtimes)
  * ➖ Configuration can be a bit time-consuming
* [💕 Using the shared instance *(~1 min)*](/.github/readme/partials/documentation/setup/shared.md)
  * ✔️ Easily configurable and previewable
  * ➖ Limited features *(compute-intensive features are disabled)*
* [🏗️ Deploying a web instance *(~20 min)*](/.github/readme/partials/documentation/setup/web.md)
  * ✔️ Create another shared instance
  * ➖ Requires some sysadmin knowledge
* [🐳 Using command line with docker *(~2 min)*](/.github/readme/partials/documentation/setup/docker.md)
  * ✔️ Suited for one-time rendering
* [🔧 Local setup for development *(~20 min)*](/.github/readme/partials/documentation/setup/local.md)

Additional resources for setup:
* [🏦 Configure metrics for organizations](/.github/readme/partials/documentation/organizations.md)
* [🏠 Run metrics on self-hosted runners](/.github/readme/partials/documentation/selfhosted.md)
* [🧰 Template/Plugin compatibility matrix](/.github/readme/partials/documentation/compatibility.md)