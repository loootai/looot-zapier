# Create HubSpot contacts from new Typeform entries with verified emails and company data from looot

Slug: `typeform-leads-to-hubspot`. Steps: 5. Usual cost: about $0.0034 per lead.

Same job as [n8n #2116 Verify emails and enrich new form leads into HubSpot (3,432 views)](https://n8n.io/workflows/2116): 7 n8n nodes and 2 data API accounts there, 5 Zap steps and 1 data account here.

## Title

Create HubSpot contacts from new Typeform entries with verified emails and company data from looot

## Description

Form leads with bad emails or no company details clutter a CRM. When someone submits your Typeform, looot checks that the email can receive mail, looks up the company from the website they gave, and only then creates or updates the HubSpot contact with company name, industry and size. Leads with undeliverable emails stop before HubSpot. *Note: add a website or company domain question to your form for the company lookup.*

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **Typeform**, event **New Entry**.
   - Form: leave empty
3. Action 2: pick **looot**, event **Verify Email**.
   - Email: map `{{1. Email answer}}`
4. Filter 3: pick **Filter by Zapier**, event **Only continue if...**.
   - Condition: map `{{2. Deliverable}} (Boolean) Is true`
5. Action 4: pick **looot**, event **Enrich Company**.
   - Company Domain: map `{{1. Website answer}}`
6. Action 5: pick **HubSpot**, event **Create or Update Contact**.
   - Email: map `{{1. Email answer}}`
   - First Name: map `{{1. First name answer}}`
   - Last Name: map `{{1. Last name answer}}`
   - Company Name: map `{{4. Company Name}}`
   - Industry: map `{{4. Industry}}`
   - Website URL: map `{{4. Company Domain}}`
7. Click **Submit**. Paste the title and description above. Click **Save Draft**.
8. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
9. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
