# Upstream's full image build no longer works (outdated Chrome/Ruby/gem toolchain),
# so reuse the official prebuilt v3.34 image and overlay the patched sources
FROM ghcr.io/lowlighter/metrics:v3.34
COPY source /metrics/source
