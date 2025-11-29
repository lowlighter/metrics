# Use original pre-built image as base (contains all dependencies)
# This avoids rebuilding Chrome, Node modules, etc. when only code changes
ARG BASE_IMAGE=ghcr.io/lowlighter/metrics:v3.35-beta
FROM ${BASE_IMAGE} as base

# Copy only our changed files (GraphQL queries and JS code)
# This is much faster than rebuilding everything
COPY source/plugins/achievements/queries/achievements.graphql /metrics/source/plugins/achievements/queries/achievements.graphql
COPY source/plugins/achievements/queries/organizations.graphql /metrics/source/plugins/achievements/queries/organizations.graphql
COPY source/plugins/achievements/list/users.mjs /metrics/source/plugins/achievements/list/users.mjs
COPY source/plugins/achievements/list/organizations.mjs /metrics/source/plugins/achievements/list/organizations.mjs
COPY source/plugins/habits/index.mjs /metrics/source/plugins/habits/index.mjs

# No need to rebuild - the base image already has everything installed
# Our code changes are just file replacements

# Environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_BROWSER_PATH "google-chrome-stable"

# Execute GitHub action
ENTRYPOINT node /metrics/source/app/action/index.mjs
