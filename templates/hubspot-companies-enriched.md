# Update new HubSpot companies with industry and size from looot

Slug: `hubspot-companies-enriched`. Steps: 3. Usual cost: from $0.0019 per company.

## Title

Update new HubSpot companies with industry and size from looot

## Description

Sales teams need industry and headcount on every account to route and score it. When a company is added to HubSpot, looot looks it up by its domain and writes the industry and size back to the company record. A company looot cannot match is left as it was and costs nothing.

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **HubSpot**, event **New Company**.
   - no fields to set
3. Action 2: pick **looot**, event **Enrich Company**.
   - Company Domain: map `{{1. Company Domain Name}}`
   - Company Name: map `{{1. Name}}`
4. Action 3: pick **HubSpot**, event **Update Company**.
   - Company: map `{{1. Record ID}}`
   - Industry: map `{{2. Industry}}`
   - Number of Employees: map `{{2. Company Size}}`
5. Click **Submit**. Paste the title and description above. Click **Save Draft**.
6. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
7. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
