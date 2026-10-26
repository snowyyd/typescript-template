#!/usr/bin/env bash
set -euo pipefail

# Colors
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
CYAN="\033[1;36m"
NC="\033[0m"

echo -e "${CYAN}Starting setup...${NC}"

# Explicitly load NVM since postCreateCommand runs in a non-interactive shell
export NVM_DIR="/usr/local/share/nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"
else
  echo -e "${YELLOW}Error: NVM not found at $NVM_DIR${NC}" >&2
  exit 1
fi

# Node.js
if [ "${INSTALL_NODE:-0}" = "1" ]; then
  echo -e "${YELLOW}Installing latest Node.js...${NC}"

  nvm install --default node
  nvm reinstall-packages system
  npm update --global --force
  pnpm self-update

  echo -e "${GREEN}Node.js installation complete.${NC}"
else
  echo -e "${CYAN}Skipping Node.js.${NC}"
fi

# Bun (minified version of https://bun.sh/install)
if [ "${INSTALL_BUN:-0}" = "1" ]; then
  echo -e "${YELLOW}Installing Bun...${NC}"

  BUN_TARGET="${BUN_TARGET:-linux-x64}"
  BUN_VERSION="${BUN_VERSION:-latest}"
  INSTALL_DIR="${BUN_INSTALL:-$HOME/.bun}"
  BIN_DIR="$INSTALL_DIR/bin"
  BIN="$BIN_DIR/bun"

  mkdir -p "$BIN_DIR"

  if [ "$BUN_VERSION" = "latest" ]; then
    BUN_URI="https://github.com/oven-sh/bun/releases/latest/download/bun-$BUN_TARGET.zip"
  else
    BUN_URI="https://github.com/oven-sh/bun/releases/download/$BUN_VERSION/bun-$BUN_TARGET.zip"
  fi

  curl --fail --location --progress-bar --output "$BIN.zip" "$BUN_URI"
  unzip -oqd "$BIN_DIR" "$BIN.zip"
  mv "$BIN_DIR/bun-$BUN_TARGET/bun" "$BIN"
  chmod +x "$BIN"
  rm -rf "$BIN_DIR/bun-$BUN_TARGET" "$BIN.zip"

  echo -e "${GREEN}Bun installation complete.${NC}"
else
  echo -e "${CYAN}Skipping Bun.${NC}"
fi

echo -e "${GREEN}Setup finished successfully.${NC}"
