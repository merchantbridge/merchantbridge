# Merchant Bridge documentation

This directory holds the operational and developer documentation for the Merchant Bridge platform. Each file is the source of truth for one area.

## Index

| Document | Covers |
| --- | --- |
| [chat-ai.md](./chat-ai.md) | Public support chat, AI provider fallback order, and configuration |
| [developer-cli.md](./developer-cli.md) | CLI setup, scoped keys, and n8n / Make / Zapier publishing |
| [developer-plans.md](./developer-plans.md) | Developer plan capacity and limit guidance |
| [blog-publishing.md](./blog-publishing.md) | Journal generation, Blogger connection, and the design editor |
| [mobile-release.md](./mobile-release.md) | Signed Android build, verification, and web download |
| [documentation-generation.md](./documentation-generation.md) | How the in-app community and developer guides are generated and validated |
| [hero-artwork.md](./hero-artwork.md) | Hero image art direction and the assets each page expects |
| [DUAL_DATABASE_SETUP.md](./DUAL_DATABASE_SETUP.md) | Supabase primary plus optional Neon backup/fallback |
| [operations/hosting-and-recovery.md](./operations/hosting-and-recovery.md) | Hosting decision, backup design, and Cloudflare cutover checks |

## Related resources

- Root [README.md](../README.md) — project overview, stack, scripts, and environment.
- In-app help: `/docs` (community guides) and `/console/docs` (developer guides).
- CLI: `scripts/merchantbridge-cli.mjs`, invoked with `npm run merchantbridge -- <command>`.

## Conventions

- Documentation must describe only verified behaviour. When a capability is not implemented, say so rather than describing an intended design as if it were live.
- Never place API keys, service-role keys, tokens, connection strings, or other secrets in these files.
- Keep the docs in this folder for operators and developers; keep member-facing help in the in-app guide system.
