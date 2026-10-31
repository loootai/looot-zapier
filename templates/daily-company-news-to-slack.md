# Get daily Slack messages with Google News articles about a company from looot

Slug: `daily-company-news-to-slack`. Steps: 3. Usual cost: about $0.001 per day.

Review risk: Run Operation needs the job id typed in, and Zapier lists hardcoded values as a rejection reason. Submit it after the dedicated templates are approved, or ship a Search News action first.

## Title

Get daily Slack messages with Google News articles about a company from looot

## Description

Competitor and account news is useful only when the team sees it the same day. Every morning, looot searches Google News for the company you name and posts the articles to a Slack channel with their titles and links. Each search costs about a tenth of a cent. *Note: put the company name in the Input field of the looot step, as {"query": "Company name"}.*

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **Schedule by Zapier**, event **Every Day**.
   - Time of Day: 8am
3. Action 2: pick **looot**, event **Run Operation**.
   - Endpoint or Job ID: job:news.search
   - Input (JSON): leave empty, the user writes {"query": "<company>"}
4. Action 3: pick **Slack**, event **Send Channel Message**.
   - Channel: leave empty
   - Message Text: map `News today:
{{2. Result News Title}}
{{2. Result News Link}}`
5. Click **Submit**. Paste the title and description above. Click **Save Draft**.
6. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
7. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
