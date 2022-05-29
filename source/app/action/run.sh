# Check runner compatibility
echo "::group::Metrics docker image setup"
echo "GitHub action: $METRICS_ACTION ($METRICS_ACTION_PATH)"
cd $METRICS_ACTION_PATH
for DEPENDENCY in docker jq; do
  if ! which $DEPENDENCY > /dev/null 2>&1; then
    echo "::error::\"$DEPENDENCY\" is not installed on current runner but is needed to run metrics"
    MISSING_DEPENDENCIES=1
  fi
done
if [[ $MISSING_DEPENDENCIES == "1" ]]; then
  echo "Runner compatibility: missing dependencies"
  exit 1
else
  echo "Runner compatibility: compatible"
fi

# Create environment file from inputs and GitHub variables
touch .env
for INPUT in $(echo $INPUTS | jq -r 'to_entries|map("INPUT_\(.key|ascii_upcase)=\(.value|@uri)")|.[]'); do
  echo $INPUT >> .env
done
env | grep -E '^(GITHUB|ACTIONS|CI|TZ)' >> .env
echo "Environment variables: loaded"

# Renders output folder
METRICS_RENDERS="/metrics_renders"
sudo mkdir -p $METRICS_RENDERS
echo "Renders output folder: $METRICS_RENDERS"

# Source repository (picked from action name)
METRICS_SOURCE=$(echo $METRICS_ACTION | sed -E 's/metrics.*?$//g' | sed -E 's/_//g')
echo "Source: $METRICS_SOURCE"

# Version (picked from package.json)
METRICS_VERSION=$(grep -Po '(?<="version": ").*(?=")' package.json)
echo "Version: $METRICS_VERSION"

# Image tag (extracted from version or from env)
METRICS_TAG=v$(echo $METRICS_VERSION | sed -r 's/^([0-9]+[.][0-9]+).*/\1/')
echo "Image tag: $METRICS_TAG"

# Image name
# Official action
if [[ $METRICS_SOURCE == "lowlighter" ]]; then
  # Use registry with pre-built images
  if [[ ! $METRICS_USE_PREBUILT_IMAGE =~ ^([Ff]alse|[Oo]ff|[Nn]o|0)$ ]]; then
    # Is released version
    set +e
    METRICS_IS_RELEASED=$(expr $(expr match $METRICS_VERSION .*-beta) == 0)
    set -e
    echo "Is released version: $METRICS_IS_RELEASED"
    if [[ "$METRICS_IS_RELEASED" -eq "0" ]]; then
      METRICS_TAG="$METRICS_TAG-beta"
      echo "Image tag (updated): $METRICS_TAG"
    fi
    METRICS_IMAGE=ghcr.io/lowlighter/metrics:$METRICS_TAG
    echo "Using pre-built version $METRICS_TAG, will pull docker image from GitHub registry"
    if ! docker image pull $METRICS_IMAGE; then
      echo "Failed to fetch docker image from GitHub registry, will rebuild it locally"
      METRICS_IMAGE=metrics:$METRICS_VERSION
    fi
  # Rebuild image
  else
    echo "Using an unreleased version ($METRICS_VERSION)"
    METRICS_IMAGE=metrics:$METRICS_VERSION
  fi
# Forked action
else
  echo "Using a forked version"
  METRICS_IMAGE=metrics:forked-$METRICS_VERSION
fi
echo "Image name: $METRICS_IMAGE"

# Build image if necessary
set +e
docker image inspect $METRICS_IMAGE
METRICS_IMAGE_NEEDS_BUILD="$?"
set -e
if [[ "$METRICS_IMAGE_NEEDS_BUILD" -gt "0" ]]; then
  echo "Image $METRICS_IMAGE is not present locally, rebuilding it from Dockerfile"
  docker build -t $METRICS_IMAGE .
else
  echo "Image $METRICS_IMAGE is present locally"
fi
echo "::endgroup::"

# Run docker image with current environment
docker run --init --rm --volume $GITHUB_EVENT_PATH:$GITHUB_EVENT_PATH --volume $METRICS_RENDERS:/renders --env-file .env $METRICS_IMAGE
rm .env