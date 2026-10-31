# Add work emails to new Google Sheets rows with looot

Slug: `sheets-rows-to-work-emails`. Steps: 3. Usual cost: from $0.0036 per email found.

## Title

Add work emails to new Google Sheets rows with looot

## Description

Lead lists often have a name and a company but no email. When a row is added to your sheet, looot finds the person's work email and writes it back to the same row with a check result. Only lookups that ran are charged, and a miss costs nothing. *Note: your sheet needs columns for first name, last name, company domain, email and email check.*

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **Google Sheets**, event **New Spreadsheet Row**.
   - Drive: leave empty
   - Spreadsheet: leave empty
   - Worksheet: leave empty
3. Action 2: pick **looot**, event **Find Work Email**.
   - First Name: map `{{1. First Name}}`
   - Last Name: map `{{1. Last Name}}`
   - Company Domain: map `{{1. Domain}}`
4. Action 3: pick **Google Sheets**, event **Update Spreadsheet Row**.
   - Spreadsheet: leave empty
   - Worksheet: leave empty
   - Row: map `{{1. Row ID}}`
   - Email: map `{{2. Email}}`
   - Email Check: map `{{2. Email Check}}`
5. Click **Submit**. Paste the title and description above. Click **Save Draft**.
6. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
7. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
