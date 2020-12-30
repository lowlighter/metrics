# Base image
FROM docker.pkg.github.com/lowlighter/metrics/metrics:latest

# Copy repository
COPY . /metrics

# Setup
RUN chmod +x /metrics/source/app/action/index.mjs \
  # Install node modules
  && cd /metrics \
  && npm ci

# Execute GitHub action
ENTRYPOINT node /metrics/source/app/action/index.mjs