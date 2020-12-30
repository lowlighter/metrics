# Base image
FROM ghcr.io/lowlighter/metrics:latest

# Copy repository
COPY . /metrics

# Execute GitHub action
ENTRYPOINT node /metrics/source/app/action/index.mjs