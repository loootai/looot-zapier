# Submission notes for Zapier

Everything the Zapier publish form is expected to ask, with the value to use. Items marked **WALID** can only come from a person. The form itself is behind a Zapier login, so the exact field list is not verified. Zapier's public docs say only that you "complete the online form" under Integration Home, then Publish, then Submit for Review.

Rules and checks come from these pages (read 2026-10-11):

- Publishing requirements: https://docs.zapier.com/integrations/publish/integration-publishing-requirements
- Build guidelines: https://docs.zapier.com/integrations/publish/integration-build-guidelines
- Integration checks reference: https://docs.zapier.com/platform/publish/integration-checks-reference
- Public integration process: https://docs.zapier.com/integrations/publish/public-integration
- Private vs public: https://docs.zapier.com/integrations/quickstart/private-vs-public-integrations

## Listing fields

| Field | Value |
| --- | --- |
| Integration name | looot |
| Short description (40 to 140 characters, starts with "looot is a", no "Zapier") | looot is a data gateway. One API key and one prepaid balance give you 2,500+ endpoints for emails, companies and search. |
| Long description | looot is a data gateway for people, companies and the web. One account and one prepaid balance give you 2,500+ endpoints from 90+ providers. Find and verify work emails, enrich a company or a person, get Google results and read the news. In a Zap you search the catalog by what you want to do, see the price per call, then run the endpoint. A failed run costs nothing. You top up from $5. There is no subscription. |
| Homepage URL (marketing site) | https://looot.ai |
| Privacy policy URL | https://looot.ai/privacy (returns 200) |
| Terms of service URL | https://looot.ai/terms (returns 200) |
| Support | support@looot.ai. Contact page: https://looot.ai/contact (returns 200) |
| API documentation URL | https://docs.looot.ai/reference.md and https://api.looot.ai/openapi.json |
| Authentication | API key (custom auth), one field "API key". Keys are created at https://looot.ai/settings?tab=agent-tokens |
| Category | **WALID** pick in the form. The category list is not in the public docs. Check M001 asks for one. A fitting pick is a data or marketing and sales category. |
| Logo | `assets/icon-256.png` (256 x 256) or a larger square PNG. Check it is RGBA. Zapier wants a square PNG, at least 256 x 256, RGBA (check M004). **WALID** uploads it. |
| Source code | https://github.com/loootai/looot-zapier (MIT) |

## Test account for reviewers

Zapier asks for a non-expiring account that its staff can sign in to. **WALID** creates it. Requirements from the publishing page:

- Register it with `integration-testing@zapier.com`. <!-- leak-scan:allow, Zapier's public reviewer address -->
- Zapier staff must be able to change its password, or it must use passwordless sign-in.
- Give it a funded balance so every action runs without trial limits. Top up enough for a few cents of runs per reviewer. The Run action spends real money.
- Create an API key for it with the scopes `catalog.read`, `runs.read`, `runs.execute`, `usage.read`, and give that key to Zapier in the form. Do not put the key in this repo.
- Add a short note for reviewers: start with Find Endpoints, then Run Endpoint with `tomba-email-finder` or any cheap endpoint, then Check Balance. Say which test endpoints cost under one cent.

## Before you submit

Zapier needs proof that every trigger, search and action works in a real Zap:

- Build one Zap per trigger, search and action (12 Zaps: 1 trigger, 3 searches, 8 actions). Zapier checks each one. Turn each on and get at least one successful run. Do not delete the Zaps or runs. These are checks S002 and T001.
- Check S001: at least 3 users with a live Zap. This blocks going public ("harder to go public"). In practice the integration is invite-only until 3 users have live Zaps. Invite 3 people with `zapier-platform users:add <email> <version>` or an invite link.
- Check A001: at least one connected account exists.
- Check M003: your role on the integration must be employee or contractor of looot. The qualifying team member rule (M005) needs an admin whose email is on the looot.ai domain. Use a `@looot.ai` address for the Zapier account that owns the integration.
- Check D027: use the latest core version if Zapier asks. This repo pins `zapier-platform-core` 19.1.0 on purpose (only releases older than 7 days). Bump it after review of the newest release.

## Commands (need Zapier login)

The docs say the CLI binary is now `zapier-platform` (`zapier` still works but is deprecated). See https://docs.zapier.com/platform/reference/cli-docs

```bash
npm install -g zapier-platform-cli@19.1.0   # pin it, do not use @latest
zapier-platform login                       # add --sso if you sign in with Google
zapier-platform register "looot"            # creates the integration, writes .zapierapprc
zapier-platform validate                    # full check, includes the ones npm run validate cannot do
zapier-platform push                        # uploads 0.2.0 as a private version
zapier-platform users:add person@example.com 0.2.0
```

Then, in the Zapier developer platform: open the integration, click Publish in Integration Home, fill the form with the table above, add the test account, and click Submit for Review. A Zapier developer replies within about a week. After approval the app is Beta for 90 days, then public.

`.zapierapprc` holds the integration ID and is created by `register`. It is git-ignored here. Commit it only if you want the repo tied to that integration.

## Things that could block us

- **Three live users.** S001 above. Needs real Zaps from three people.
- **Ownership.** Public listing is for people who work for the API owner. looot owns the API, so this passes if the Zapier account uses a looot.ai email.
- **Financial transactions rule.** Zapier bans integrations that process payments or transfer assets. Run Endpoint spends a prepaid balance on data calls. It does not move money between parties, and top-ups happen on looot.ai, not in Zapier. Mention this in the review notes so nobody reads it as payment processing. Zapier's reading of this is not documented, so treat it as a risk.
- **Data pulling rule.** Zapier bans separate actions that target specific third-party sites, and user-facing text that says "scraping". This integration has a generic Run Operation and Run Endpoint action and avoids that word. Some catalog endpoints read web pages or LinkedIn profiles. A reviewer may ask about them. Be ready to say the Run action is generic and the catalog is looot's.
- **One integration per brand.** Only one public looot integration is allowed (M007). Do not register a second.
- **Warnings** (such as D004, "ID fields should use dynamic dropdowns") do not block. The Run Endpoint field accepts an endpoint ID on purpose, next to the dropdown.

## Naming check against Zapier's guidelines

Trigger, search and action names are title case. Trigger description starts with "Triggers when". Search descriptions start with "Finds". Action descriptions start with a third-person verb ("Runs", "Reads"). None names the app. Input labels are sentence case. Searches return arrays and an empty array when nothing matches. Actions never return a success when a run failed.
