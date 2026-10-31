# Add work emails to new Airtable records from LinkedIn profile URLs with looot

Slug: `airtable-linkedin-to-work-emails`. Steps: 3. Usual cost: from $0.0036 per email found.

## Title

Add work emails to new Airtable records from LinkedIn profile URLs with looot

## Description

Prospect lists built from LinkedIn have profile links but no emails. When a record with a LinkedIn profile URL is added to your Airtable base, looot finds the person's work email and writes it and its check result to the record. Only lookups that ran are charged.

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **Airtable**, event **New Record**.
   - Base: leave empty
   - Table: leave empty
3. Action 2: pick **looot**, event **Find Work Email**.
   - LinkedIn Profile URL: map `{{1. LinkedIn URL}}`
4. Action 3: pick **Airtable**, event **Update Record**.
   - Base: leave empty
   - Table: leave empty
   - Record: map `{{1. ID}}`
   - Email: map `{{2. Email}}`
   - Email Check: map `{{2. Email Check}}`
5. Click **Submit**. Paste the title and description above. Click **Save Draft**.
6. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
7. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
