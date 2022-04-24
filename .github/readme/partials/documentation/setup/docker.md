# 🐳 Using command line with docker (~2 min)

## 0️ Prepare your machine

A machine with a recent version of [docker](https://www.docker.com/) is required.

## 1️ Run docker image

The command to use is similar to the following:
```shell
docker run --rm --env INPUT_TOKEN=**** --env INPUT_USER=user --volume=/tmp:/renders ghcr.io/lowlighter/metrics:latest
```

To pass parameters, pass environment variable with the same name as the corresponding action option but in uppercase and prefixed with `INPUT_`.

Generated files will be created in the mounted `/renders` directory.

> 💡 When running *metrics* with docker, [`output_action`](/source/plugins/core/README.md#-configuring-output-action) will automatically default to `none` instead. To use a different output action, both `GITHUB_REPOSITORY` (notice the absence of `INPUT_` prefix) and `INPUT_COMMITTER_TOKEN` (with sufficient permissions) environment variables must be set.
