# Save new Google Forms responses to Google Sheets with company data from looot

Slug: `google-forms-signups-enriched-to-sheets`. Steps: 3. Usual cost: from $0.0019 per response.

## Title

Save new Google Forms responses to Google Sheets with company data from looot

## Description

Event and webinar signups tell you little about who is coming. When someone fills in your Google Form, looot looks up their company from the website they gave, and a row with their answers plus the company's industry and size is added to your sheet. A company looot cannot match still gets a row, with the company fields empty. *Note: your form needs a question for the company website.*

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **Google Forms**, event **New Form Response**.
   - Form: leave empty
3. Action 2: pick **looot**, event **Enrich Company**.
   - Company Domain: map `{{1. Company website}}`
4. Action 3: pick **Google Sheets**, event **Create Spreadsheet Row**.
   - Spreadsheet: leave empty
   - Worksheet: leave empty
   - Name: map `{{1. Name}}`
   - Email: map `{{1. Email}}`
   - Company: map `{{2. Company Name}}`
   - Industry: map `{{2. Industry}}`
   - Size: map `{{2. Company Size}}`
5. Click **Submit**. Paste the title and description above. Click **Save Draft**.
6. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
7. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
