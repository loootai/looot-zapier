# Add new Google Sheets emails to Mailchimp only after looot verifies them

Slug: `sheets-emails-verified-to-mailchimp`. Steps: 4. Usual cost: $0.00145 per address.

## Title

Add new Google Sheets emails to Mailchimp only after looot verifies them

## Description

Sending to bad addresses hurts your sender reputation and wastes audience slots. When a row with an email is added to your sheet, looot checks whether the address can receive mail, and only deliverable addresses are added to your Mailchimp audience. Each check is charged once, and a failed check costs nothing.

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **Google Sheets**, event **New Spreadsheet Row**.
   - Spreadsheet: leave empty
   - Worksheet: leave empty
3. Action 2: pick **looot**, event **Verify Email**.
   - Email: map `{{1. Email}}`
4. Filter 3: pick **Filter by Zapier**, event **Only continue if...**.
   - Condition: map `{{2. Deliverable}} (Boolean) Is true`
5. Action 4: pick **Mailchimp**, event **Add/Update Subscriber**.
   - Audience: leave empty
   - Subscriber Email: map `{{1. Email}}`
   - First Name: map `{{1. First Name}}`
6. Click **Submit**. Paste the title and description above. Click **Save Draft**.
7. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
8. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
