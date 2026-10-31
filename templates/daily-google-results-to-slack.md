# Get daily Slack messages with Google results for a keyword from looot

Slug: `daily-google-results-to-slack`. Steps: 3. Usual cost: about $0.0009 per day.

## Title

Get daily Slack messages with Google results for a keyword from looot

## Description

Watching where your site and your competitors show up on Google is easy to forget. Every morning, looot runs a Google search for the keyword you choose and posts the top results to a Slack channel, so the team sees changes without opening a rank tracker. Each search costs about a tenth of a cent. *Note: set the keyword and country in the looot step.*

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **Schedule by Zapier**, event **Every Day**.
   - Time of Day: 8am
   - Trigger on Weekends?: no
3. Action 2: pick **looot**, event **Search Google**.
   - Query: leave empty
   - Country: leave empty
4. Action 3: pick **Slack**, event **Send Channel Message**.
   - Channel: leave empty
   - Message Text: map `Google results for "{{2. Query}}" today:
{{2. Result Organic Title}}
{{2. Result Organic Link}}`
5. Click **Submit**. Paste the title and description above. Click **Save Draft**.
6. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
7. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
