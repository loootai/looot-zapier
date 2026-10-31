# Create Google Sheets rows for finished looot runs

Slug: `looot-runs-to-sheets`. Steps: 2. Usual cost: free.

## Title

Create Google Sheets rows for finished looot runs

## Description

Data spend is hard to follow when several tools share one balance. Each time a run in your looot workspace finishes, a row with the endpoint, the provider that answered, the status and the cost is added to your sheet. The log itself costs nothing.

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **looot**, event **Run Finished**.
   - no fields to set
3. Action 2: pick **Google Sheets**, event **Create Spreadsheet Row**.
   - Spreadsheet: leave empty
   - Worksheet: leave empty
   - Run ID: map `{{1. Run ID}}`
   - Endpoint: map `{{1. Endpoint ID}}`
   - Provider: map `{{1. Provider}}`
   - Status: map `{{1. Status}}`
   - Cost: map `{{1. Cost (USD)}}`
   - Completed: map `{{1. Completed At}}`
4. Click **Submit**. Paste the title and description above. Click **Save Draft**.
5. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
6. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
