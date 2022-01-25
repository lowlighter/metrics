# 🐳 Using command line with docker (~2 min)

## 0️ Prepare your machine

A server with a recent version of [docker](https://www.docker.com/) is required.

## 1️ Run docker image

The command to use is similar to the following:
```shell
docker run --env INPUT_TOKEN=**** --env INPUT_USER=user --volume=/tmp:/renders ghcr.io/lowlighter/metrics:latest
```

To pass parameters, pass environment variable with the same name as the corresponding action option but in uppercase and prefixed with `INPUT_`.
