# Base image
FROM docker.pkg.github.com/lowlighter/metrics/metrics:latest

# Copy repository
COPY . /metrics

# Execute GitHub action
ENTRYPOINT node /metrics/source/app/action/index.mjs