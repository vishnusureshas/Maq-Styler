#!/usr/bin/env bash
# Remote deploy for the ecommerce stack: pulls prebuilt GHCR images and restarts.
# Run on the EC2 instance from the repo root. The GitHub Actions deploy job calls this.
#
# Required env: IMAGE_OWNER (ghcr.io namespace, e.g. vishnureshas)
# Optional env: IMAGE_TAG (default latest), GITHUB_TOKEN (ghcr login), APP_DIR
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/ecommerce}"
IMAGE_OWNER="${IMAGE_OWNER:?Set IMAGE_OWNER (ghcr.io namespace)}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
export IMAGE_TAG

if [ ! -d "$APP_DIR/.git" ]; then
  echo "ERROR: $APP_DIR is not a git checkout. Run deploy/ec2-setup.sh once first."
  exit 1
fi

cd "$APP_DIR"

echo "==> [1/4] Pull latest code"
git pull --ff-only

echo "==> [2/4] Determine docker access"
if docker info >/dev/null 2>&1; then
  DOCKER="docker"
elif sudo -n docker info >/dev/null 2>&1; then
  DOCKER="sudo docker"
else
  echo "ERROR: Docker is not usable by this user."
  exit 1
fi

if [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "==> Logging into GHCR as $IMAGE_OWNER"
  echo "$GITHUB_TOKEN" | $DOCKER login ghcr.io -u "$IMAGE_OWNER" --password-stdin
else
  echo "==> No GITHUB_TOKEN — relying on public GHCR packages"
fi

echo "==> [3/4] Pull images + recreate services ($IMAGE_OWNER/$IMAGE_TAG)"
$DOCKER compose -f docker-compose.prod.yml up -d --remove-orphans

echo "==> [4/4] Cleanup + smoke tests"
$DOCKER image prune -f >/dev/null 2>&1 || true

curl -fsS http://localhost:5173/health || { echo "health check failed"; exit 1; }
echo
curl -fsS http://localhost:5173/api/v1/products | head -c 300
echo

echo "Deploy complete: http://$(hostname -I | awk '{print $1}'):5173"