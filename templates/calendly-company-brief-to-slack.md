# Send Slack messages with company details for new Calendly invitees from looot

Slug: `calendly-company-brief-to-slack`. Steps: 3. Usual cost: from $0.0019 per meeting.

## Title

Send Slack messages with company details for new Calendly invitees from looot

## Description

Walking into a sales call without knowing the company wastes the first minutes. When someone books a meeting in Calendly, looot looks up their company and posts its name, industry and size to a Slack channel, so the host can prepare before the call. *Note: add a question for the company website to your Calendly event type.*

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **Calendly**, event **Invitee Created**.
   - Webhook Subscription Scope: leave as default
3. Action 2: pick **looot**, event **Enrich Company**.
   - Company Domain: map `{{1. Questions And Answers Answer}}`
4. Action 3: pick **Slack**, event **Send Channel Message**.
   - Channel: leave empty
   - Message Text: map `New meeting with {{1. Invitee Name}} ({{1. Invitee Email}}) at {{2. Company Name}}: {{2. Industry}}, {{2. Company Size}} people. Starts {{1. Event Start Time}}.`
5. Click **Submit**. Paste the title and description above. Click **Save Draft**.
6. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
7. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
