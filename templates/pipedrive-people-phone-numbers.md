# Add phone numbers to new Pipedrive people with looot

Slug: `pipedrive-people-phone-numbers`. Steps: 3. Usual cost: from $0.0048 per number found.

## Title

Add phone numbers to new Pipedrive people with looot

## Description

Reps who call need a direct number, and copying one in by hand for each new contact takes time. When a person is added to Pipedrive, looot looks for their phone number from their email and name and adds it to the person. looot tries the next phone provider when one finds nothing, and a miss costs nothing.

## Build it in the Zap template editor

1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).
2. Trigger 1: pick **Pipedrive**, event **New Person**.
   - no fields to set
3. Action 2: pick **looot**, event **Find Phone Number**.
   - Work Email: map `{{1. Email Value}}`
   - Full Name: map `{{1. Name}}`
   - Company Name: map `{{1. Organization Name}}`
4. Action 3: pick **Pipedrive**, event **Update Person**.
   - Person: map `{{1. ID}}`
   - Phone: map `{{2. Phone}}`
5. Click **Submit**. Paste the title and description above. Click **Save Draft**.
6. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.
7. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.

Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.
