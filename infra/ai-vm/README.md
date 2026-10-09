# Merchant Bridge AI VM

This stack runs Ollama on an ARM-compatible Ubuntu VM. Vercel remains the web host; when `LOCAL_AI_BASE_URL` is configured, chat and blog generation use this Ollama endpoint before external providers.

On the VM, copy `bootstrap.sh`, `docker-compose.yml`, and `nginx.conf` into `/opt/merchantbridge-ai`, set `LOCAL_AI_MODEL`, and run `bootstrap.sh`. Put the private Ollama port behind HTTPS and an access-control layer such as Tailscale or an authenticated reverse proxy. Do not expose port 11434 directly.

To run the existing Vercel blog route from the VM, install the systemd service and timer, create `/etc/merchantbridge/merchantbridge-cron.env` with `CRON_SECRET`, then enable `merchantbridge-blog-cron.timer`. Keep `CRON_SECRET` identical to the Vercel production value.

Vercel variables:

```text
LOCAL_AI_BASE_URL=https://ai.your-domain.example
LOCAL_AI_API_KEY=<same secret enforced by your proxy>
LOCAL_AI_MODEL=qwen2.5:7b
```
