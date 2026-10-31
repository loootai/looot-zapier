# Get Slack alerts for new Salesforce leads with undeliverable emails from looot

Slug: `salesforce-bad-lead-emails-to-slack`. Steps: 4. Usual cost: $0.00145 per lead.

## Title

Get Slack alerts for new Salesforce leads with undeliverable emails from looot

## Description

A lead with a bad email gets worked for days before anyone notices it bounces. When a lead is created in Salesforce, looot checks the email, and leads whose address is invalid are posted to a Slack channel so someone can fix or drop them. Each check costs $0.00145.

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **Salesforce**, event **New Lead**.
   - no fields to set
3. Action 2: pick **looot**, event **Verify Email**.
   - Email: map `{{1. Email}}`
4. Filter 3: pick **Filter by Zapier**, event **Only continue if...**.
   - Condition: map `{{2. Email Status}} (Text) Exactly matches invalid`
5. Action 4: pick **Slack**, event **Send Channel Message**.
   - Channel: leave empty
   - Message Text: map `Lead {{1. First Name}} {{1. Last Name}} ({{1. Company}}) has an undeliverable email: {{1. Email}}`
6. Click **Submit**. Paste the title and description above. Click **Save Draft**.
7. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
8. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
