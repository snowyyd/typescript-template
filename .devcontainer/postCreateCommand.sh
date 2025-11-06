#!/bin/bash
set -e

nvm install --default node
nvm reinstall-packages system
npm update --global --force
corepack install --global pnpm

# Bun.sh
# curl -fsSL https://bun.sh/install | bash
npm install --global bun
