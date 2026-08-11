#!/usr/bin/env bash
# EC2 provisioning + deploy script for the ecommerce Docker stack
# Run once as the ubuntu user:  bash ec2-setup.sh <git-repo-url>
set -euo pipefail

REPO_URL="${1:?usage: bash ec2-setup.sh <git-repo-url>}"
APP_DIR="$HOME/ecommerce"

echo "==> Installing base packages"
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl git htop

echo "==> Installing Docker Engine"
curl -fsSL https://get.docker.com -o "$HOME/get-docker.sh"
sudo sh "$HOME/get-docker.sh"
rm -f "$HOME/get-docker.sh"

echo "==> Adding user to docker group"
sudo usermod -aG docker "$USER"

echo "==> Installing compose v2 plugin"
sudo apt-get install -y docker-compose-plugin

echo "==> Cloning repo"
rm -rf "$APP_DIR"
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

if [ ! -f backend/.env ]; then
  echo "==> Creating backend/.env from example (EDIT IT with real secrets!)"
  cp backend/.env.example backend/.env
  {
    echo "JWT_SECRET='$(openssl rand -hex 32)'"
    echo "JWT_REFRESH_SECRET='$(openssl rand -hex 32)'"
    echo "SESSION_SECRET='$(openssl rand -hex 32)'"
  } >> backend/.env
fi

echo "==> Starting stack"
sudo docker compose up -d --build

echo "==> Status"
sudo docker compose ps

echo "==> Smoke tests"
curl -sS http://localhost/api/v1/products | head -c 300; echo
curl -sS http://localhost/health

echo
echo "DONE. Frontend: http://<EC2-PUBLIC-IP>"
echo "Restart your ssh session so the docker group takes effect."