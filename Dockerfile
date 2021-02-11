# Base image
FROM node:15-buster-slim

# Copy repository
COPY . /metrics

# Setup
RUN chmod +x  /metrics/source/app/action/index.mjs \
  # Install latest chrome dev package, fonts to support major charsets and skip chromium download on puppeteer install
  # Based on https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker
  && apt-get update \
  && apt-get install -y wget gnupg ca-certificates libgconf-2-4 \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  # Install ruby to support github gems
  # Based on https://github.com/github/linguist and https://github.com/github/licensed
  && apt-get update \
  && apt-get install -y ruby-full \
  && apt-get install -y git g++ cmake pkg-config libicu-dev zlib1g-dev libcurl4-openssl-dev libssl-dev ruby-dev \
  && gem install github-linguist \
  && gem install licensed \
  # Install python for node-gyp
  && apt-get update \
  && apt-get install -y python3 \
  # Install node modules
  && cd /metrics \
  && npm ci \
  # Rebuild indexes
  && npm run index

# Environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_BROWSER_PATH "google-chrome-stable"

# Execute GitHub action
ENTRYPOINT node /metrics/source/app/action/index.mjs