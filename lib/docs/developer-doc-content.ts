export type DeveloperDocContent = {
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const developerDocContent: Record<string, DeveloperDocContent> = {
  "getting-started": {
    intro: "Merchant Bridge exposes a small, deliberately narrow HTTP API for reading the public shop and community, managing your own app records, and publishing reviewed community posts. Everything is served from the Merchant Bridge origin using standard JSON over HTTPS.",
    sections: [
      { heading: "What you can build today", paragraphs: [
        "The supported surface is intentionally limited. Public endpoints return health, shop, and community data without credentials. Authenticated endpoints let an app owner create and list apps, create and revoke scoped API keys, register webhook URLs, and publish community posts. There is no generic /api/v1 namespace, no isolated sandbox, and no outbound webhook delivery in this release.",
      ] },
      { heading: "Create your first app", paragraphs: [
        "Sign in with a Merchant Bridge account, open Console and register an app with a clear name and description. An app is the container for keys and webhook registrations. You can create up to 100 apps per account.",
        "Register a narrowly named app such as “n8n company posts” rather than a catch-all app. This keeps keys, scopes, and future auditability separated by purpose.",
      ] },
      { heading: "Make your first request", paragraphs: [
        "Start with a public endpoint so you can confirm connectivity before dealing with credentials: GET https://www.demerchantbridge.com/api/health. Then read the shop or feed with GET /api/shop?category=&page= or GET /api/community/posts.",
        "For authenticated calls, create a key in Console with only the scope you need and send it as an Authorization: Bearer header. Never call an authenticated endpoint from a browser bundle or mobile client where the key could be extracted.",
      ] },
      { heading: "Keep the surface minimal", paragraphs: [
        "Treat every documented route as the complete contract. If a capability is not listed here or in the Console, assume it is unavailable rather than guessing at a URL. Unsupported or assumed endpoints are a common source of integration failures.",
      ] },
    ],
  },
  authentication: {
    intro: "Merchant Bridge authenticates API requests with Bearer API keys or a signed-in account session. Keys are scoped, expire, and are shown only once, so every integration must store them in a server-side secret store.",
    sections: [
      { heading: "API keys", paragraphs: [
        "API keys are created in Console or through the key-management endpoint and begin with the gg_ prefix followed by random characters. The full key is displayed exactly once at creation; Merchant Bridge stores only a hash and a short prefix for later identification.",
        "Send the key as Authorization: Bearer gg_…. A key that is missing, expired, revoked, or unknown returns HTTP 401. A valid key that lacks the required scope returns HTTP 403.",
      ] },
      { heading: "Scopes and permissions", paragraphs: [
        "Every key is limited to the scopes selected when it was created, and every endpoint requires a specific scope. Choose the smallest set that makes the integration work; a read-only integration should never hold a write scope.",
      ] },
      { heading: "Expiry and rotation", paragraphs: [
        "Keys default to a 90-day expiry and can be created to expire within a year. Rotate before expiry by creating a replacement, deploying it, then revoking the old key. Revocation is immediate.",
      ] },
      { heading: "Session authentication", paragraphs: [
        "Browser requests from a signed-in Merchant Bridge account can use the session cookie instead of a key. Server-to-server integrations should always use a key, because a session cannot be safely embedded in an external service.",
      ] },
      { heading: "What never to do", paragraphs: [
        "Do not embed a key in client code, mobile source, screenshots, logs, posts, or repositories. Do not share one key across unrelated integrations, and do not grant a key more scopes than the task requires.",
      ] },
    ],
  },
  projects: {
    intro: "Apps, also called projects, are the organisational unit for keys, scopes, and webhook registrations on a Merchant Bridge account. Each app has its own records so one integration cannot be confused with another.",
    sections: [
      { heading: "When to create a new app", paragraphs: [
        "Create a separate app for each distinct integration or environment. A scheduled publishing workflow, an internal dashboard reader, and a staging test harness should not share one app, because they have different scopes and different lifecycles.",
      ] },
      { heading: "Creating and listing apps", paragraphs: [
        "An owner can create apps with POST /api/developer/apps and list them with GET /api/developer/apps. Names are 1 to 100 characters and descriptions up to 2,000 characters. A single account can hold up to 100 apps.",
      ] },
      { heading: "Scopes within a project", paragraphs: [
        "Keys belong to an app, and their scopes are validated against the creating account's own permissions. When you list keys for an app you see their prefix, scopes, expiry, and revocation status, but never the secret itself.",
      ] },
      { heading: "Housekeeping", paragraphs: [
        "Revoke keys and remove webhook registrations you no longer use. A tidy project makes incidents easier to reason about and prevents forgotten credentials from remaining valid.",
      ] },
    ],
  },
  sandbox: {
    intro: "This release does not include an isolated sandbox environment. There are no separate test credentials, no simulated webhook delivery, and no isolated data set. Integrations should be built to test safely against production without creating misleading or unwanted content.",
    sections: [
      { heading: "There is no isolated sandbox", paragraphs: [
        "Do not assume sandbox routes, sandbox keys, or a sandbox data namespace exist. If a workflow needs to be exercised, use public read endpoints and authenticated calls that only list or read your own records.",
      ] },
      { heading: "Testing read paths", paragraphs: [
        "The public endpoints are safe to call repeatedly while developing: GET /api/health, GET /api/shop, and GET /api/community/posts. These let you verify parsing, pagination, and error handling without touching any account data.",
      ] },
      { heading: "Testing write paths carefully", paragraphs: [
        "Write operations affect real records. Community publishing creates a real post visible to the community, and app or key creation creates real resources. Test publishing rarely, with accurate content, and remember the three-posts-per-24-hours limit and the four-hour spacing between automated posts.",
      ] },
      { heading: "A practical test approach", paragraphs: [
        "Keep a dedicated app for experimentation, grant it only the scopes under test, and revoke its keys when you finish. Log request identifiers from error responses so a failed call can be traced without repeating it.",
      ] },
    ],
  },
  "api-keys": {
    intro: "API keys are the credentials an integration uses to act as the Merchant Bridge account that owns them. They are scoped, hashed at rest, shown once, and can be revoked at any time.",
    sections: [
      { heading: "Creating a key", paragraphs: [
        "Create keys in Console or with POST /api/developer/apps/{id}/keys. Supply the scopes the integration needs and, optionally, an expiry. The response contains the full key exactly once along with a message reminding you to store it securely.",
      ] },
      { heading: "Choosing scopes", paragraphs: [
        "Available scopes are apps:read, apps:write, keys:write, webhooks:write, community:publish, and community:draft. A key can only hold scopes the creating account already has, and every request is checked against both the key's scopes and the account's status.",
      ] },
      { heading: "Limits and expiry", paragraphs: [
        "An app can hold up to 100 active keys. Keys default to a 90-day expiry and may be set to expire within the next year. Short-lived keys reduce the impact of accidental exposure.",
      ] },
      { heading: "Revoking and rotating", paragraphs: [
        "Revoke a key with DELETE /api/developer/keys/{id}. Revocation is immediate and effective for the next request. For rotation, create the replacement first, update the integration, confirm it works, then revoke the old key.",
      ] },
      { heading: "Handling the secret", paragraphs: [
        "The full key is never retrievable again. Store it in the integration platform's encrypted credential store, restrict who can read it, and never place it in command arguments, logs, or shared documents.",
      ] },
    ],
  },
  scopes: {
    intro: "Scopes define exactly what a key may do. Merchant Bridge uses a small fixed set so integrations can be granted the least privilege they need.",
    sections: [
      { heading: "The available scopes", paragraphs: [
        "apps:read lets a key list apps and their keys and webhook registrations. apps:write lets it create apps. keys:write lets it create and revoke keys. webhooks:write lets it register webhook URLs and events. community:publish lets it publish posts, and community:draft lets it generate editorial drafts.",
      ] },
      { heading: "Least privilege in practice", paragraphs: [
        "A publishing workflow usually needs only community:publish; add community:draft only if it also generates drafts for human review. A monitoring script needs only apps:read. Avoid bundling unrelated scopes into one key.",
      ] },
      { heading: "Scope inheritance", paragraphs: [
        "A key's scopes cannot exceed the creating account's own permissions. When creating a key you must select scopes that both exist and are within your account's current access. Requests are rejected if the account is not active.",
      ] },
      { heading: "Reading the errors", paragraphs: [
        "A missing scope returns HTTP 403 with a message naming the required scope. If a key that used to work now fails, check whether it was revoked, expired, or whether the account status changed.",
      ] },
    ],
  },
  profiles: {
    intro: "Merchant Bridge profiles are public introductions for community members and merchants. Account email addresses are private and must never be treated as profile data.",
    sections: [
      { heading: "Public profile fields", paragraphs: [
        "Public profiles appear at /merchant/{id} and /members/{id} and show a display name, introduction, country, and business details where provided. Active accounts can appear in the member directory even when their business profile is incomplete.",
      ] },
      { heading: "What stays private", paragraphs: [
        "The account email used to sign in is never shown on public profiles, the member directory, posts, or merchant cards. Integrations must not attempt to surface it, and must not encourage members to paste it into public content.",
      ] },
      { heading: "Merchant versus buyer profiles", paragraphs: [
        "Buyers do not need a trade deck. Merchants remain discoverable while their business details or trade deck are incomplete, but a product's visibility depends on listing review and publication status, not on a document upload.",
      ] },
      { heading: "Respecting the boundary", paragraphs: [
        "When you display profile data, keep it to the fields Merchant Bridge marks public. Do not join or infer private data, and do not present community membership as an endorsement or verified partnership.",
      ] },
    ],
  },
  buyers: {
    intro: "Buyer workflows on Merchant Bridge are centered on enquiry and conversation rather than checkout. The API exposes public catalogue and feed reads; sourcing, quoting, and negotiation happen in the product interface and in private messages.",
    sections: [
      { heading: "What buyers can do through the API", paragraphs: [
        "A buyer-facing integration can read the public shop with GET /api/shop?category=&page= and the public community feed with GET /api/community/posts. There is no buyer checkout, order, or payment endpoint.",
      ] },
      { heading: "Enquiry, not ordering", paragraphs: [
        "Products are enquiry-based. Browsing a product does not reserve stock or place an order, and the buyer request action is Request a quote. Merchant Bridge provides no payments, shipping, escrow, guaranteed sales, or automated matching.",
      ] },
      { heading: "External supplier entries", paragraphs: [
        "Some shop entries are genuine external supplier cards that identify their source, such as AliExpress or Faire, and link to that supplier's website. External entries older than seven days or known to be out of stock are hidden, and unknown prices or stock stay unknown.",
      ] },
      { heading: "Conversation and privacy", paragraphs: [
        "Private conversations are only visible to their participants. Buyers should keep delivery lists, recipient names, and contact details in private messages rather than in public posts or profiles.",
      ] },
    ],
  },
  community: {
    intro: "The community API lets an approved developer account publish community posts programmatically. Publishing is rate-limited, idempotent, and attributed to the real account that owns the key.",
    sections: [
      { heading: "Publishing a post", paragraphs: [
        "Send POST /api/developer/community/posts with an Authorization bearer key holding community:publish, a JSON body containing body and an optional topic, and an Idempotency-Key header. The body accepts up to 2,000 characters and the topic up to 40.",
        "Author identity, timestamps, and publication status are managed by Merchant Bridge and cannot be supplied by the caller.",
      ] },
      { heading: "Rate limits", paragraphs: [
        "Automated publishing is limited to three posts per account in any 24 hours, with at least four hours between posts. Exceeding the schedule returns HTTP 429; wait rather than retrying immediately.",
      ] },
      { heading: "Drafts and review", paragraphs: [
        "Use community:draft with POST /api/developer/community/drafts to produce an editorial draft from a brief. Drafting never publishes, so route the draft through human review before publishing it with community:publish.",
      ] },
      { heading: "Reading the community", paragraphs: [
        "GET /api/community/posts is public and returns published posts, comments, and counts. Posts are the only community content that supports comments.",
      ] },
      { heading: "Eligibility", paragraphs: [
        "Publishing requires an active account with a suitable role and a Merchant Bridge profile, and the account must be enabled for community automation. If it is not enabled, publishing returns an error instead of silently succeeding.",
      ] },
    ],
  },
  webhooks: {
    intro: "Console can register an HTTPS webhook URL and a list of event names for an app. Registration is supported; outbound event delivery is not enabled in this release.",
    sections: [
      { heading: "Registering an endpoint", paragraphs: [
        "Send POST /api/developer/apps/{id}/webhooks with webhooks:write and a JSON body containing a public HTTPS url and an array of event names. Credentials, fragments, and private or local hostnames are rejected, and each URL may have up to 20 event names.",
      ] },
      { heading: "No delivery yet", paragraphs: [
        "The response explicitly reports deliveryEnabled: false, and the listing endpoint returns the same flag. Do not build a workflow that depends on receiving events, because none are sent in this release.",
      ] },
      { heading: "What to do instead", paragraphs: [
        "For scheduled work, have your automation platform call the HTTP publishing endpoint directly. Treat webhook registration as recorded intent that will become active when Merchant Bridge announces event delivery.",
      ] },
      { heading: "Future-proofing", paragraphs: [
        "Choose stable, descriptive event names and an endpoint you control so that enabling delivery later requires no re-registration. Keep the endpoint idempotent so replay protection is natural.",
      ] },
    ],
  },
  retries: {
    intro: "Networks fail, so integrations retry. Merchant Bridge makes community publishing safe to retry through an idempotency key and returns clear conflict and rate-limit responses for the cases it cannot accept.",
    sections: [
      { heading: "Idempotency keys", paragraphs: [
        "Every publish request must include an Idempotency-Key header of 8 to 100 letters, digits, underscores, or hyphens. Use a stable value tied to the source event, such as a workflow execution ID or record ID, not a random value per attempt.",
      ] },
      { heading: "Safe retry behavior", paragraphs: [
        "Retrying the same key with the same body returns the original post with replayed: true and does not create a duplicate. Reusing the key with different content returns HTTP 409, which is a permanent error and should not be retried unchanged.",
      ] },
      { heading: "Rate-limit responses", paragraphs: [
        "HTTP 429 means the publishing schedule is full or the spacing between posts was too short. Back off and wait rather than retrying in a tight loop.",
      ] },
      { heading: "General backoff", paragraphs: [
        "For transient 5xx responses, retry with exponential backoff and a cap. Do not retry 400, 401, 403, 404, or 413 responses without changing the request, because they indicate a problem the retry will reproduce.",
      ] },
    ],
  },
  cron: {
    intro: "Merchant Bridge does not provide a hosted cron scheduler for third-party integrations in this release. Recurring work should be scheduled in your own platform and executed against the documented HTTP endpoints.",
    sections: [
      { heading: "No hosted cron for integrations", paragraphs: [
        "There is no endpoint for creating, listing, or running integration cron jobs. The schedule limits described in the developer plans are forward-looking and are not a live scheduler you can call.",
      ] },
      { heading: "Scheduling externally", paragraphs: [
        "Use n8n, Make, Zapier, a cloud scheduler, or your own infrastructure to trigger requests on a cadence. Authenticate with a scoped key and respect the publishing limits when the task posts to the community.",
      ] },
      { heading: "Timezones and reliability", paragraphs: [
        "Record the timezone your schedule runs in and keep runs idempotent. If a scheduled run fails, retry it with the same idempotency key so a partial success cannot duplicate content.",
      ] },
      { heading: "Keeping runs observable", paragraphs: [
        "Log the request identifier returned in error responses, alert on repeated failures, and pause the schedule if its source data becomes stale or misleading rather than publishing low-quality content.",
      ] },
    ],
  },
  automations: {
    intro: "Automations connect Merchant Bridge to tools such as n8n, Make, and Zapier using each platform's standard HTTP request action and a narrowly scoped API key.",
    sections: [
      { heading: "Connect with an HTTP action", paragraphs: [
        "Create an app and a key with only the scope the automation needs, then call the documented endpoints with an Authorization bearer header. Use the platform's encrypted credential store for the key and suppress request headers in execution logs.",
      ] },
      { heading: "Publishing safely", paragraphs: [
        "Map a stable unique identifier from the trigger to the Idempotency-Key header so retries cannot create duplicate posts. Respect the three-posts-per-24-hours limit and the four-hour spacing between automated posts.",
      ] },
      { heading: "Human review for AI", paragraphs: [
        "If the automation uses community:draft, insert a human approval step before publishing. Drafting does not publish, and generated text should never include invented testimonials, product claims, or activity attributed to other people.",
      ] },
      { heading: "Keeping automation honest", paragraphs: [
        "Publish as the real account that owns the key. Integrations cannot impersonate members, and posts are always attributed to the key's owner. Do not use automation to manufacture engagement such as likes, comments, follows, or messages.",
      ] },
    ],
  },
  chatbots: {
    intro: "Merchant Bridge includes a public support chat route, /api/chat, backed by a server-only AI adapter that falls back across several configured providers. The adapter handles public support questions and does not access private member conversations or documents.",
    sections: [
      { heading: "How the chat adapter works", paragraphs: [
        "lib/ai/chat.ts tries configured providers in order: Ollama Cloud, Groq, Gemini, GitHub Models, OpenRouter, Hugging Face, SambaNova, Novita, AI/ML API, then Hyperbolic. It moves on when a provider errors, times out, exhausts quota, or returns empty output, with a 20-second timeout per provider.",
      ] },
      { heading: "What the chat can see", paragraphs: [
        "The endpoint sends only the last 12 messages, with a 2,000-character limit per message. It does not load private member conversations or documents and cannot make account changes.",
      ] },
      { heading: "Configuration", paragraphs: [
        "Configure server-side environment variables only, never NEXT_PUBLIC variables. Each provider works independently; configuring at least two enables automatic fallback. Quotas belong to the provider accounts and can interrupt responses.",
      ] },
      { heading: "Privacy disclosure", paragraphs: [
        "The widget discloses that content is processed by an external AI provider and asks users not to submit sensitive information. Do not connect private messages or documents to the public support route.",
      ] },
    ],
  },
  "rate-limits": {
    intro: "The current developer API does not publish per-key request quotas or return documented rate-limit headers. The one enforced limit is the community publishing schedule, and integrations should still back off politely on transient errors.",
    sections: [
      { heading: "The publishing schedule", paragraphs: [
        "Automated community publishing is limited to three posts per account in any 24 hours, with at least four hours between posts. These are the only documented publishing limits, and exceeding them returns HTTP 429.",
      ] },
      { heading: "No published request quotas", paragraphs: [
        "Do not assume specific request-per-minute quotas or rate-limit response headers, because none are published in this release. Build integrations that behave well even without explicit quota signals.",
      ] },
      { heading: "Be a good citizen", paragraphs: [
        "Cache public reads where sensible, avoid tight polling loops, and use exponential backoff for 5xx responses. Sustained abusive traffic can be suspended by monitoring.",
      ] },
      { heading: "Plan limits", paragraphs: [
        "The developer plans document intended monthly request and delivery allowances for apps, cron jobs, keys, and webhooks. Treat those figures as plan guidance rather than a live enforcement service.",
      ] },
    ],
  },
  errors: {
    intro: "Merchant Bridge returns JSON errors with a stable shape so integrations can react predictably. Every failure includes an error message and a request identifier for support.",
    sections: [
      { heading: "Error shape", paragraphs: [
        "Failures return a JSON object with an error string and a requestId, and responses are marked no-store. Log the requestId when you report a problem so it can be traced without repeating the request.",
      ] },
      { heading: "Client errors", paragraphs: [
        "HTTP 400 means the request is malformed or a field is invalid, 401 means the credential is missing or invalid, 403 means the credential lacks the required scope or the account is inactive, 404 means the resource does not exist, 409 means a conflict such as reusing an idempotency key with different content, and 413 means the payload is too large.",
      ] },
      { heading: "Server and rate errors", paragraphs: [
        "HTTP 429 means the publishing schedule is full or too closely spaced. HTTP 502 indicates a generation failure, and 503 indicates a temporary dependency outage such as database or provider unavailability.",
      ] },
      { heading: "Handling errors well", paragraphs: [
        "Retry only transient 5xx and 429 responses, with backoff. Fix the request for 4xx responses instead of retrying. Return useful messages to your own users without leaking credentials or internal details.",
      ] },
    ],
  },
  security: {
    intro: "API keys act as the account that owns them, so protecting them is the single most important part of an integration. The rest of this guide covers the practical rules that keep credentials and data safe.",
    sections: [
      { heading: "Protect every key", paragraphs: [
        "Store keys only in server-side secret stores, restrict who can read them, and never place them in client bundles, mobile source, screenshots, logs, command arguments, or repositories. Revoke any key that may have been exposed.",
      ] },
      { heading: "Use the smallest scope", paragraphs: [
        "Grant the minimum scopes a task needs and separate apps by purpose. A leaked read-only key is far less damaging than a key that can publish or manage keys.",
      ] },
      { heading: "Rotate and expire", paragraphs: [
        "Create keys with a deliberate expiry, rotate them before they lapse, and revoke unused keys promptly. Revocation takes effect immediately.",
      ] },
      { heading: "Validate transport and input", paragraphs: [
        "Call only HTTPS endpoints, treat supplied content as untrusted, and avoid acting on data from a request beyond what the endpoint intends. Do not attempt to surface private account data such as email addresses.",
      ] },
      { heading: "Report abuse", paragraphs: [
        "If you suspect a key or workflow has been compromised, revoke the key and contact Merchant Bridge support. Automation that behaves abusively can be suspended by monitoring.",
      ] },
    ],
  },
  "data-privacy": {
    intro: "Merchant Bridge handles member and merchant data, and some of it is private by design. Integrations must respect that boundary and keep private account details out of public content.",
    sections: [
      { heading: "Private by default", paragraphs: [
        "The account email used to sign in is private and must never appear on public profiles, the member directory, posts, merchant cards, or any integration output. Private conversations are visible only to their participants.",
      ] },
      { heading: "Public data only", paragraphs: [
        "The public endpoints expose published community posts, shop entries, health, and public profile fields. Do not attempt to join, infer, or reconstruct private data from public responses.",
      ] },
      { heading: "Handling user content", paragraphs: [
        "Treat any content submitted through your integration as untrusted input. Avoid copying personal details into logs, and store only what the task genuinely requires.",
      ] },
      { heading: "Retention and deletion", paragraphs: [
        "Keep credentials and cached data only as long as needed, and remove records you no longer require. When a data-handling question is not covered here, ask Merchant Bridge support rather than assuming a policy.",
      ] },
    ],
  },
  production: {
    intro: "Before an integration goes live, review the practical checklist that prevents avoidable incidents: credentials, scopes, error handling, and monitoring.",
    sections: [
      { heading: "Credentials and scopes", paragraphs: [
        "Confirm production keys are stored in a secret manager, hold only the scopes they need, and have a planned expiry and rotation. Remove any development keys from production systems.",
      ] },
      { heading: "Endpoints and domains", paragraphs: [
        "Call the correct Merchant Bridge origin over HTTPS, and register webhook URLs you control even though delivery is not yet enabled. Avoid hard-coding test data into production flows.",
      ] },
      { heading: "Error handling and retries", paragraphs: [
        "Make retries idempotent, back off on 429 and transient 5xx responses, and never retry permanent 4xx responses unchanged. Capture request identifiers from errors for support.",
      ] },
      { heading: "Monitoring and rollback", paragraphs: [
        "Alert on repeated failures, monitor publishing against the schedule limits, and keep a rollback plan so automation can be paused quickly if its content or source data becomes unreliable.",
      ] },
      { heading: "Final review", paragraphs: [
        "Exercise the integration end to end, verify it publishes accurately as the correct account, and document who owns the key and how to revoke it in an incident.",
      ] },
    ],
  },
  changelog: {
    intro: "Merchant Bridge's developer API is intentionally small, and changes are communicated through the documentation and Console rather than a formal versioned API. Treat the documented routes as the contract and watch for updates.",
    sections: [
      { heading: "How changes are communicated", paragraphs: [
        "Behaviour changes, new endpoints, and newly enabled capabilities such as webhook delivery are announced in Merchant Bridge documentation and Console. There is no separate API version parameter in this release.",
      ] },
      { heading: "Avoid depending on undocumented behavior", paragraphs: [
        "Do not rely on fields, headers, or routes that are not documented. Undocumented behaviour can change without notice, so build against the stated contract only.",
      ] },
      { heading: "Preparing for change", paragraphs: [
        "Keep integrations tolerant of added response fields, pin your own dependency versions, and isolate Merchant Bridge calls so a change can be updated in one place.",
      ] },
      { heading: "Staying current", paragraphs: [
        "Re-check this documentation and Console notes after upgrades, and test critical flows such as publishing and key rotation when a change is announced.",
      ] },
    ],
  },
};
