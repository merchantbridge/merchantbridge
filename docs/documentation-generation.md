# In-app documentation generation

Merchant Bridge serves two in-app documentation sets: community help guides at `/docs` and developer guides at `/console/docs`. Both are defined in TypeScript, rendered by the App Router, and validated before publication. This file explains how they are built and how to regenerate them.

## Community guides

The guide catalogue lives in `lib/docs/community-docs.ts`. It defines fourteen sections (Getting started, Accounts, Profiles, Community, Member directory, Merchant products, Trade decks, Buyer sourcing, Market, Merchant workflow, Developer reference, CLI, Images and files, Help) using a compact row format. Each row becomes a guide with a generated slug, title, summary, ordered steps, category, destination route, and section context.

`communityGuides` is the flattened list of all 219 guides. `scripts/docs/validate.mjs` asserts that there are exactly 219 unique guides and that the CLI and Trade decks sections contain the expected counts.

## Generated article bodies

A guide can be rendered from a generated long-form article. Generated articles live as one JSON file per guide in `content/docs/<slug>.json` with this shape:

```json
{
  "slug": "getting-started-what-merchant-bridge-does",
  "intro": "…",
  "sections": [{ "heading": "…", "paragraphs": ["…"] }],
  "reviewVersion": 2
}
```

`lib/docs/article.ts` defines the validation rules used everywhere:

- 6–12 sections, each with at least one paragraph; paragraphs at least 30 characters
- 1,000–2,400 words in total
- no repeated paragraph anywhere
- no HTML, no `community publish`/`community draft` CLI fragments, and no private automation instructions

`scripts/docs/generate.mjs` produces the files. It reads a build token from `.merchantbridge-docs-build-token`, calls `POST /api/admin/docs/draft` on the configured origin, and for each guide:

1. reuses a valid `content/docs/<slug>.json` reviewVersion 2 file if present
2. otherwise generates a draft, then asks the endpoint to review it
3. applies review corrections and retries until the reviewer approves, then writes `reviewVersion: 2`

Drafts are cached under `.merchantbridge-docs-drafts/` so an interrupted run can resume. The endpoint itself validates every article with `validateDocArticle` and only returns approved JSON.

### Running generation locally

The endpoint requires `MERCHANTBRIDGE_DOCS_BUILD_TOKEN` to match the `Authorization: Bearer` header, and at least one writing provider (`GEMINI_API_KEY`, `GROQ_API_KEY`, or `CEREBRAS_API_KEY`). To generate against a local server:

```bash
MERCHANTBRIDGE_DOCS_BUILD_TOKEN=local-docs-token npm run dev
# in another terminal, point the generator at the local origin
echo local-docs-token > .merchantbridge-docs-build-token
# then run a generator that targets http://localhost:3000
```

Generation is rate-limited by the AI provider and takes several minutes per guide because each guide is generated and then reviewed. It is resumable, so it can be run repeatedly until every guide is present.

### Validation and bundling

```bash
node scripts/docs/validate.mjs            # report valid/required counts and problems
node scripts/docs/validate.mjs --bundle   # also write lib/docs/articles.json
```

`lib/docs/library.ts` builds `publishedGuides` from `communityGuides`. When a generated article exists for a slug it is used directly; otherwise the library synthesises a shorter article from the guide's summary, context, and steps. This means `/docs` always renders something useful even while generation is incomplete.

## Developer guides

Developer guides are defined in `lib/docs/developer-docs.ts` (slug, title, description) and their bodies live in `lib/docs/developer-doc-content.ts`. `app/console/docs/[slug]/page.tsx` renders the body when present and a safe generic fallback otherwise. `generateStaticParams` pre-renders every guide.

## Security notes

- The draft endpoint is authorised solely by `MERCHANTBRIDGE_DOCS_BUILD_TOKEN`; treat it as a secret and never commit it.
- Generated prose must not expose API paths as web pages, private automation instructions, member emails, or unsupported capabilities. The reviewer prompt and `validateDocArticle` both enforce this.
- Keep provider keys server-side only and never prefix them with `NEXT_PUBLIC_`.
