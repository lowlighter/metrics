# Base image
FROM node:24-trixie-slim

# Environment variables
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_BROWSER_PATH=google-chrome-stable

# Copy repository
COPY . /metrics
WORKDIR /metrics

# Setup
RUN chmod +x /metrics/source/app/action/index.mjs \
  && apt-get update \
  # Install latest chrome stable package (signed keyring, apt-key is gone) and fonts to support major charsets
  && apt-get install -y --no-install-recommends wget gnupg ca-certificates \
  && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
  && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-noto-core fonts-freefont-ttf libxss1 libx11-xcb1 libxtst6 lsb-release \
  # Install deno for miscellaneous scripts
  && apt-get install -y --no-install-recommends curl unzip \
  && curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s -- -y \
  # Build tools for native node modules (ruby/licensed dropped: rugged no longer builds, only used by optional licenses plugin)
  && apt-get install -y --no-install-recommends git g++ make \
  # Install python for node-gyp
  && apt-get install -y --no-install-recommends python3 \
  # Clean apt/lists
  && rm -rf /var/lib/apt/lists/* \
  # Install node modules and rebuild indexes
  && npm ci \
  && npm run build

# Execute GitHub action
ENTRYPOINT ["node", "/metrics/source/app/action/index.mjs"]
