#!/bin/bash
set -euo pipefail

# colors
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
CYAN="\033[1;36m"
NC="\033[0m"

echo -e "${CYAN}Starting setup...${NC}"

# install Node.js & pnpm
if [ "${INSTALL_NODE:-0}" = "1" ]; then
  echo -e "${YELLOW}Installing latest Node.js...${NC}"

  nvm install --default node
  nvm reinstall-packages system
  npm update --global --force

  # setup pnpm
  echo -e "${YELLOW}Installing pnpm (via corepack)...${NC}"
  corepack install --global pnpm

  echo -e "${GREEN}Node.js and pnpm installation complete.${NC}"
else
  echo -e "${CYAN}Skipping Node.js/pnpm.${NC}"
fi

# Bun.sh
if [ "${INSTALL_BUN:-0}" = "1" ]; then
  echo -e "${YELLOW}Installing Bun...${NC}"

  # curl -fsSL https://bun.sh/install | bash
  npm install --global --allow-scripts=bun bun

  echo -e "${GREEN}Bun installation complete. Please restart your terminal.${NC}"
else
  echo -e "${CYAN}Skipping Bun.${NC}"
fi

echo -e "${GREEN}Setup finished successfully.${NC}"
