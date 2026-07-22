#!/bin/bash
set -e

# install latest Node.js
# nvm install --default node
# nvm reinstall-packages system
# npm update --global --force

# setup pnpm
# corepack install --global pnpm

# Bun.sh
# curl -fsSL https://bun.sh/install | bash
npm install --global --allow-scripts=bun bun
