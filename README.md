<p align="center"><img src="assets/hero.png" alt="looot for Zapier" width="100%"></p>

# looot-zapier

[![License](https://img.shields.io/github/license/loootai/looot-zapier)](LICENSE) [![Docs](https://img.shields.io/badge/docs-docs.looot.ai-12A06A)](https://docs.looot.ai)

A Zapier Platform CLI app for [looot](https://looot.ai): one key and one prepaid balance for 4,200+ data
endpoints from 300+ providers. A Zap can find a work email, verify it, find a phone number, enrich a company, search Google, or run any
other endpoint in the catalog. You see the price before a run and a failed call costs nothing.

Status: source only. Not pushed to Zapier and not in the Zapier app directory yet. The steps to deploy your
own private copy are below.

## What is in the app

| Kind | Name in Zapier | REST route | Cost |
|---|---|---|---|
| Action | Find Work Email | `POST /v1/runs` with `job:people.email.find` | from $0.003598 per call |
| Action | Verify Email | `POST /v1/runs` with `job:people.email.verify` | from $0.00145 per call |
| Action | Enrich Company | `POST /v1/runs` with `job:company.enrich` | from $0.0019 per call |
| Action | Find Phone Number | `POST /v1/runs` with `job:people.phone.find` | from $0.00483 per call |
| Action | Search Google | `POST /v1/runs` with `job:google.serp.organic` | from $0.0009 per call |
| Action | Run Operation | `POST /v1/runs` with any endpoint or `job:<id>` | the endpoint's price |
| Search | Find Operations in Catalog | `GET /v1/catalog/search?q=` | free |
| Search | Find Operation Details | `GET /v1/operations/{endpointId}` | free |
| Search | Find Run | `GET /v1/runs/{runId}` | free |
| Trigger | Run Finished | `GET /v1/runs?limit=50`, polled | free |

Prices are the cheapest provider of each job in the public catalog
(`GET https://api.looot.ai/v1/catalog/overview?depth=jobs`) on 2026-10-08 (the phone and Google rows on 2026-10-09). They change; Find Operations in
Catalog returns the live price.

Zapier's naming rules want every search to start with "Find", so the catalog search, the inspect call and
the run lookup carry those names. Their keys in code are `search_catalog`, `inspect_operation` and `get_run`.

### How a run step behaves

- **Fields.** Each run action takes Try Other Providers (on by default), Max Cost (USD), Wait (Seconds)
  and Idempotency Key.
- **Try Other Providers** sends `fallback: true`. With Max Cost set it sends
  `fallback: {"enabled": true, "maxCostUsd": <n>}`. looot then tries the next provider of the same job
  when the first finds nothing, and charges only the attempts that ran.
- **Wait** is capped at 25 seconds because Zapier stops a step after about 30. A run that takes longer
  comes back with status `queued` or `running`. Add a Find Run step, or use the Run Finished trigger in a
  second Zap.
- **Idempotency key.** Zapier does not give an action a run id (`bundle.meta` has none in
  zapier-platform-core 19.1.0). When the field is empty the step sends
  `zapier-<sha256 of zap id, endpoint, input and UTC date>`. A step Zapier retries replays the same looot
  run and pays once. The same lookup on a later day runs fresh. Map a record id from your trigger into the
  field if you want your own rule.
- **Output.** Every run returns `id`, `status`, `actualCost`, the provider's raw `result`, and `fields`
  (looot's [normalized output](https://docs.looot.ai/concepts/normalized-output) when the provider has a
  field map). Find Work Email also returns `email` and `check` at the top level, Verify Email returns
  `email_status` and `deliverable`, Enrich Company returns `company_name`, `company_domain`, `industry`
  and `size`, Find Phone Number returns `phone`. Search Google has no field map: the results page is in
  `result`, in the shape of the provider that answered. These are `null` when the provider that answered has no field map; the raw `result` is
  always there.
- **Errors.** A run that ends `failed`, `blocked` or `stopped` fails the step with looot's own error code
  and message. HTTP 402 names the top-up page. HTTP 429 asks Zapier to retry after the `Retry-After` time.

The Run Finished trigger reads the 50 newest runs of the workspace and keeps the ones whose status is
`completed`, `failed`, `blocked` or `stopped`. Rows are summaries without the result payload; add Find Run
to read the result.

## Authentication

API key auth. The connection asks for one field, Agent Token. Create it in the looot dashboard under
Settings, Agent tokens, with `catalog.read`, `runs.read`, `runs.execute` and `usage.read`. Every request
sends `Authorization: Bearer <token>` to `https://api.looot.ai`. The connection test calls
`GET /v1/balance`.

## Zap templates

[templates/](templates) holds 12 Zap template specs for this integration: work emails for new Google Sheets rows, verified Typeform leads into HubSpot, HubSpot company enrichment, phone numbers for Pipedrive people, Calendly meeting briefs in Slack and more. Zapier builds templates in its own editor, so each spec lists the title, the description and every step with its field mappings. They can be submitted once the integration is published.

## Test

```bash
npm ci --ignore-scripts
npm test            # 25 tests, HTTP mocked with nock, no looot account needed
npm run validate    # the schema check `zapier validate` runs, through zapier-platform-core
```

Output on 2026-10-09, Node 24.18.0:

```
ℹ tests 25
ℹ pass 25
ℹ fail 0

schema valid: 1 trigger, 3 searches, 6 creates, platform 19.1.0
```

`zapier validate` from zapier-platform-cli 19.1.0 also runs without a login. This output is from 0.1.0,
before Find Phone Number and Search Google were added; run it again before `zapier push`:

```
Validating project locally
No structural errors found during validation routine.
This project is structurally sound!

- Running integration checks
    - 25 checks passed
    - 0 checks failed
    - 0 checks with publishing warning
    - 5 checks with general warning
```

The 5 warnings, none of which blocks a push:

- D004 three times: `endpoint_id` and `run_id` have no dropdown. The catalog has 2,600 endpoints, so the
  field stays free text and Find Operations in Catalog fills it.
- D003: no connection label. The balance route returns no short account name to show.
- D027: core 19.2.0 exists. It was published on 2026-10-07 and this repo only pins releases older than
  7 days. Bump it after 2026-10-14.

Find Phone Number and Search Google (added in 0.1.1) were tested with mocked HTTP only. Their job ids
are in the public catalog; the input names (`linkedin_url`, `email`, name and company for phone, `query`
and `country` for Google) follow the looot docs and have not been through a paid run from Zapier.

No test calls the live API, so no test spends credit. The first live run happens in the Zap editor with
your own token.

## Deploy your private copy

Needs a Zapier account. A private integration needs no review and you can share it by invite link.

```bash
npm install -g zapier-platform-cli@19.1.0
git clone https://github.com/loootai/looot-zapier && cd looot-zapier
npm ci --ignore-scripts
zapier login
zapier register "looot"
zapier push
```

Then in the Zapier developer dashboard upload `assets/icon-256.png` as the logo, and build one Zap per
action to check it against your own balance. `zapier users:links` prints the invite link for other people.

## Publish to the Zapier app directory (maintainers)

Zapier's publishing requirements, read on 2026-10-08
(https://docs.zapier.com/integrations/publish/integration-publishing-requirements):

1. The Zapier account that owns the integration has an admin with an `@looot.ai` address (rule 7.2).
2. A looot account that does not expire exists for `integration-testing@zapier.com` (rule 7.1). <!-- leak-scan:allow Zapier's reviewer address -->
   It needs a token and enough balance to run each action.
3. Every trigger, action and search has a turned-on test Zap with one successful run (rule 5.3).
4. Listing description, written to rule 6.2: "looot is a data API platform that gives a workflow one key
   and one prepaid balance for work emails, email verification, company data and web search results."
5. `zapier promote 0.1.1`, then submit the version for review in the Zapier developer dashboard.

## Develop

Dependencies are pinned to exact versions and `.npmrc` sets `ignore-scripts=true`. Node 22 or newer
(Zapier runs integrations on Node 22). Docs used: https://docs.zapier.com/platform/build-cli/overview,
read on 2026-10-08.

```bash
git config core.hooksPath .githooks   # runs scripts/leak-scan.sh before each commit
```

## Related

- [n8n-nodes-looot](https://github.com/loootai/n8n-nodes-looot), [looot-make](https://github.com/loootai/looot-make), [looot-activepieces](https://github.com/loootai/looot-activepieces): the same operations on other automation tools.
- [looot-mcp](https://github.com/loootai/looot-mcp): the remote MCP server, `claude mcp add --transport http looot https://api.looot.ai/mcp`.
- [awesome-gtm](https://github.com/loootai/awesome-gtm): open-source GTM tools.

MIT, copyright looot.
