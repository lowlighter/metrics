# Use official pre-built image as base, only overlay patched file
FROM ghcr.io/lowlighter/metrics:v3.34

# Apply fix: guard against null commit entries in habits plugin
COPY source/plugins/habits/index.mjs /metrics/source/plugins/habits/index.mjs

# Re-use original entrypoint
ENTRYPOINT ["/bin/sh", "-c", "node /metrics/source/app/action/index.mjs"]
