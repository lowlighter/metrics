# Metrics docker image
FROM alpine:3.18
RUN apk upgrade --no-cache --available

# Install sudo
RUN apk add --update --no-cache sudo \
  && echo 'metrics ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/metrics

# Install licensed
RUN apk add --no-cache ruby \
  && apk add --no-cache --virtual .licensed ruby-dev make cmake g++ heimdal-dev \
  && gem install licensed \
  && apk del .licensed \
  && licensed --version

# Install chromium
ENV CHROME_BIN /usr/bin/chromium-browser
ENV CHROME_PATH /usr/lib/chromium/
ENV CHROME_EXTRA_FLAGS "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"
RUN apk add --no-cache chromium ttf-freefont font-noto-emoji \
  && apk add --no-cache --repository=https://dl-cdn.alpinelinux.org/alpine/edge/community font-wqy-zenhei \
  && chromium --version

# Install docker
RUN apk add --update --no-cache docker-cli \
  && addgroup docker \
  && docker --version

# Install deno
ENV DENO_INSTALL /
ENV DENO_NO_UPDATE_CHECK true
ENV DENO_VERSION 1.38.3
ENV GLIBC_VERSION 2.34-r0
RUN apk add --no-cache --virtual .deno curl wget unzip \
  && wget --no-hsts --quiet --output-document /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub \
  && wget --no-hsts --quiet https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-${GLIBC_VERSION}.apk \
  && wget --no-hsts --quiet https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-bin-${GLIBC_VERSION}.apk \
  && wget --no-hsts --quiet https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-i18n-${GLIBC_VERSION}.apk \
  && mv /etc/nsswitch.conf /etc/nsswitch.conf.bak \
  && apk add --no-cache --force-overwrite glibc-${GLIBC_VERSION}.apk glibc-bin-${GLIBC_VERSION}.apk glibc-i18n-${GLIBC_VERSION}.apk \
  && mv /etc/nsswitch.conf.bak /etc/nsswitch.conf \
  && (/usr/glibc-compat/bin/localedef --force --inputfile POSIX --charmap UTF-8 "$LANG" || true) \
  && (echo "export LANG=$LANG" > /etc/profile.d/locale.sh) \
  && rm /etc/apk/keys/sgerrand.rsa.pub glibc-${GLIBC_VERSION}.apk glibc-bin-${GLIBC_VERSION}.apk glibc-i18n-${GLIBC_VERSION}.apk \
  && apk del glibc-i18n \
  && (curl -fsSL https://deno.land/x/install/install.sh | sh) \
  && apk del .deno \
  && deno upgrade --version ${DENO_VERSION} \
  && deno --version

# Install lighthouse
RUN apk add --no-cache npm \
  && npm install --global lighthouse \
  && lighthouse --version

# General configuration
RUN apk add --no-cache git \
  && adduser --system metrics \
  && addgroup metrics docker

# Metrics
USER metrics
WORKDIR /metrics
ENV TZ Europe/Paris
ENV TMP /tmp
COPY source /metrics/source
COPY deno.jsonc /metrics/deno.jsonc
COPY LICENSE /metrics/LICENSE
RUN deno task make cache
RUN deno task make get:browser
ENTRYPOINT [ "deno", "task", "make", "run", "github-action" ]