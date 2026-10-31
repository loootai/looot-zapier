# Zap templates for looot

12 Zap template specs for the looot Zapier integration. Zapier builds templates in its own editor, not from a file, so each spec has the title, the description and every step with its field mappings, in the order you click them.

Status: specs only. Zap templates can only use an integration that Zapier has published (beta or public), and looot is not pushed to Zapier yet. None of these has run.

| Template | Title | Steps | Usual cost | Before / after |
|---|---|---|---|---|
| [sheets-rows-to-work-emails](sheets-rows-to-work-emails.md) | Add work emails to new Google Sheets rows with looot | Google Sheets > looot Find Work Email > Google Sheets | from $0.0036 per email found | - |
| [typeform-leads-to-hubspot](typeform-leads-to-hubspot.md) | Create HubSpot contacts from new Typeform entries with verified emails and company data from looot | Typeform > looot Verify Email > Filter by Zapier > looot Enrich Company > HubSpot | about $0.0034 per lead | 7 n8n nodes, 2 data accounts / 5 steps, 1 |
| [hubspot-companies-enriched](hubspot-companies-enriched.md) | Update new HubSpot companies with industry and size from looot | HubSpot > looot Enrich Company > HubSpot | from $0.0019 per company | - |
| [calendly-company-brief-to-slack](calendly-company-brief-to-slack.md) | Send Slack messages with company details for new Calendly invitees from looot | Calendly > looot Enrich Company > Slack | from $0.0019 per meeting | - |
| [sheets-emails-verified-to-mailchimp](sheets-emails-verified-to-mailchimp.md) | Add new Google Sheets emails to Mailchimp only after looot verifies them | Google Sheets > looot Verify Email > Filter by Zapier > Mailchimp | $0.00145 per address | - |
| [pipedrive-people-phone-numbers](pipedrive-people-phone-numbers.md) | Add phone numbers to new Pipedrive people with looot | Pipedrive > looot Find Phone Number > Pipedrive | from $0.0048 per number found | - |
| [daily-google-results-to-slack](daily-google-results-to-slack.md) | Get daily Slack messages with Google results for a keyword from looot | Schedule by Zapier > looot Search Google > Slack | about $0.0009 per day | - |
| [daily-company-news-to-slack](daily-company-news-to-slack.md) | Get daily Slack messages with Google News articles about a company from looot | Schedule by Zapier > looot Run Operation > Slack | about $0.001 per day | - |
| [salesforce-bad-lead-emails-to-slack](salesforce-bad-lead-emails-to-slack.md) | Get Slack alerts for new Salesforce leads with undeliverable emails from looot | Salesforce > looot Verify Email > Filter by Zapier > Slack | $0.00145 per lead | - |
| [google-forms-signups-enriched-to-sheets](google-forms-signups-enriched-to-sheets.md) | Save new Google Forms responses to Google Sheets with company data from looot | Google Forms > looot Enrich Company > Google Sheets | from $0.0019 per response | - |
| [airtable-linkedin-to-work-emails](airtable-linkedin-to-work-emails.md) | Add work emails to new Airtable records from LinkedIn profile URLs with looot | Airtable > looot Find Work Email > Airtable | from $0.0036 per email found | - |
| [looot-runs-to-sheets](looot-runs-to-sheets.md) | Create Google Sheets rows for finished looot runs | looot Run Finished > Google Sheets | free | - |

Before and after counts appear only where an n8n gallery template does the same job (counted from its JSON on 2026-10-31, sticky notes not counted). Prices are the cheapest provider in looot's public catalog (`https://api.looot.ai/v1/catalog/overview?depth=jobs`) on 2026-10-31.

## Zapier's rules these follow

From https://docs.zapier.com/platform/publish/zap-templates, read 2026-10-31:

- Titles start with a verb, sentence case, plural items, no "sync", "automatic", "you" or "we".
- Descriptions are one paragraph of 2 to 4 sentences that start from the user's goal, with no links and no "Zap", "trigger", "action" or "sync". Setup tips go last, in italics, starting with "Note:".
- No Code, Formatter, Paths, Webhooks or Looping steps. Filters are fine. A search must be followed by an action.
- Leave a field empty unless every user would want the value. Reviews take about 2 weeks; a published template can only be changed by asking Zapier.

`npm test` checks the title and description rules and that every looot field in a spec exists in the app.

## Order to submit

Start with the plain two- and three-step ones on popular apps: sheets-rows-to-work-emails, hubspot-companies-enriched, sheets-emails-verified-to-mailchimp, typeform-leads-to-hubspot. Zapier rejects "too many submissions for an integration with low usage", so send 3 or 4 first and the rest after they are approved. daily-company-news-to-slack goes last (see its review risk).

## Rebuild

```bash
node templates/render.js
```
