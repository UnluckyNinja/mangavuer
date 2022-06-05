# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=16
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

USER root

RUN npm i -g pnpm

EXPOSE 8080
EXPOSE 3000
EXPOSE 3333

USER codespace
