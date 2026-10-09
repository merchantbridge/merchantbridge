#!/usr/bin/env bash
set -euo pipefail

# Run on a fresh Ubuntu ARM VM as a sudo-capable user.
sudo apt-get update
sudo apt-get install -y ca-certificates curl docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo mkdir -p /opt/merchantbridge-ai
sudo cp docker-compose.yml nginx.conf /opt/merchantbridge-ai/
sudo chown -R "$USER":"$USER" /opt/merchantbridge-ai
cd /opt/merchantbridge-ai
docker compose up -d
docker exec merchantbridge-ollama ollama pull "${LOCAL_AI_MODEL:-qwen2.5:3b}"
echo "AI service is running privately on 127.0.0.1:11434"
