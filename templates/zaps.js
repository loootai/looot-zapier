'use strict';

// Zap template specs for looot. Zapier builds templates in its own editor, so each spec is the
// click-by-click setup plus the title and description, written to Zapier's template rules
// (https://docs.zapier.com/platform/publish/zap-templates, read 2026-10-31).
// `node templates/render.js` writes templates/<slug>.md and templates/README.md from this file.
//
// A step is { app, event, fields: [[field label, value]] }. Values in {{double braces}} are mapped
// from an earlier step: {{1. First Name}} means the field "First Name" of step 1. A looot step also
// names its `key` in this app so the test can check each field exists.

const LOOOT = 'looot';

const ZAPS = [
  {
    slug: 'sheets-rows-to-work-emails',
    title: 'Add work emails to new Google Sheets rows with looot',
    description: 'Lead lists often have a name and a company but no email. When a row is added to your sheet, looot finds the person\'s work email and writes it back to the same row with a check result. Only lookups that ran are charged, and a miss costs nothing. *Note: your sheet needs columns for first name, last name, company domain, email and email check.*',
    steps: [
      { app: 'Google Sheets', event: 'New Spreadsheet Row', fields: [['Drive', 'leave empty'], ['Spreadsheet', 'leave empty'], ['Worksheet', 'leave empty']] },
      { app: LOOOT, key: 'find_work_email', event: 'Find Work Email', fields: [['First Name', '{{1. First Name}}'], ['Last Name', '{{1. Last Name}}'], ['Company Domain', '{{1. Domain}}']] },
      { app: 'Google Sheets', event: 'Update Spreadsheet Row', fields: [['Spreadsheet', 'leave empty'], ['Worksheet', 'leave empty'], ['Row', '{{1. Row ID}}'], ['Email', '{{2. Email}}'], ['Email Check', '{{2. Email Check}}']] },
    ],
    cost: 'from $0.0036 per email found',
  },
  {
    slug: 'typeform-leads-to-hubspot',
    title: 'Create HubSpot contacts from new Typeform entries with verified emails and company data from looot',
    description: 'Form leads with bad emails or no company details clutter a CRM. When someone submits your Typeform, looot checks that the email can receive mail, looks up the company from the website they gave, and only then creates or updates the HubSpot contact with company name, industry and size. Leads with undeliverable emails stop before HubSpot. *Note: add a website or company domain question to your form for the company lookup.*',
    steps: [
      { app: 'Typeform', event: 'New Entry', fields: [['Form', 'leave empty']] },
      { app: LOOOT, key: 'verify_email', event: 'Verify Email', fields: [['Email', '{{1. Email answer}}']] },
      { app: 'Filter by Zapier', event: 'Only continue if...', fields: [['Condition', '{{2. Deliverable}} (Boolean) Is true']] },
      { app: LOOOT, key: 'enrich_company', event: 'Enrich Company', fields: [['Company Domain', '{{1. Website answer}}']] },
      { app: 'HubSpot', event: 'Create or Update Contact', fields: [['Email', '{{1. Email answer}}'], ['First Name', '{{1. First name answer}}'], ['Last Name', '{{1. Last name answer}}'], ['Company Name', '{{4. Company Name}}'], ['Industry', '{{4. Industry}}'], ['Website URL', '{{4. Company Domain}}']] },
    ],
    cost: 'about $0.0034 per lead',
    before: { label: 'n8n #2116 Verify emails and enrich new form leads into HubSpot (3,432 views)', url: 'https://n8n.io/workflows/2116', nodes: 7, dataAccounts: 2 },
  },
  {
    slug: 'hubspot-companies-enriched',
    title: 'Update new HubSpot companies with industry and size from looot',
    description: 'Sales teams need industry and headcount on every account to route and score it. When a company is added to HubSpot, looot looks it up by its domain and writes the industry and size back to the company record. A company looot cannot match is left as it was and costs nothing.',
    steps: [
      { app: 'HubSpot', event: 'New Company', fields: [] },
      { app: LOOOT, key: 'enrich_company', event: 'Enrich Company', fields: [['Company Domain', '{{1. Company Domain Name}}'], ['Company Name', '{{1. Name}}']] },
      { app: 'HubSpot', event: 'Update Company', fields: [['Company', '{{1. Record ID}}'], ['Industry', '{{2. Industry}}'], ['Number of Employees', '{{2. Company Size}}']] },
    ],
    cost: 'from $0.0019 per company',
  },
  {
    slug: 'calendly-company-brief-to-slack',
    title: 'Send Slack messages with company details for new Calendly invitees from looot',
    description: 'Walking into a sales call without knowing the company wastes the first minutes. When someone books a meeting in Calendly, looot looks up their company and posts its name, industry and size to a Slack channel, so the host can prepare before the call. *Note: add a question for the company website to your Calendly event type.*',
    steps: [
      { app: 'Calendly', event: 'Invitee Created', fields: [['Webhook Subscription Scope', 'leave as default']] },
      { app: LOOOT, key: 'enrich_company', event: 'Enrich Company', fields: [['Company Domain', '{{1. Questions And Answers Answer}}']] },
      { app: 'Slack', event: 'Send Channel Message', fields: [['Channel', 'leave empty'], ['Message Text', 'New meeting with {{1. Invitee Name}} ({{1. Invitee Email}}) at {{2. Company Name}}: {{2. Industry}}, {{2. Company Size}} people. Starts {{1. Event Start Time}}.']] },
    ],
    cost: 'from $0.0019 per meeting',
  },
  {
    slug: 'sheets-emails-verified-to-mailchimp',
    title: 'Add new Google Sheets emails to Mailchimp only after looot verifies them',
    description: 'Sending to bad addresses hurts your sender reputation and wastes audience slots. When a row with an email is added to your sheet, looot checks whether the address can receive mail, and only deliverable addresses are added to your Mailchimp audience. Each check is charged once, and a failed check costs nothing.',
    steps: [
      { app: 'Google Sheets', event: 'New Spreadsheet Row', fields: [['Spreadsheet', 'leave empty'], ['Worksheet', 'leave empty']] },
      { app: LOOOT, key: 'verify_email', event: 'Verify Email', fields: [['Email', '{{1. Email}}']] },
      { app: 'Filter by Zapier', event: 'Only continue if...', fields: [['Condition', '{{2. Deliverable}} (Boolean) Is true']] },
      { app: 'Mailchimp', event: 'Add/Update Subscriber', fields: [['Audience', 'leave empty'], ['Subscriber Email', '{{1. Email}}'], ['First Name', '{{1. First Name}}']] },
    ],
    cost: '$0.00145 per address',
  },
  {
    slug: 'pipedrive-people-phone-numbers',
    title: 'Add phone numbers to new Pipedrive people with looot',
    description: 'Reps who call need a direct number, and copying one in by hand for each new contact takes time. When a person is added to Pipedrive, looot looks for their phone number from their email and name and adds it to the person. looot tries the next phone provider when one finds nothing, and a miss costs nothing.',
    steps: [
      { app: 'Pipedrive', event: 'New Person', fields: [] },
      { app: LOOOT, key: 'find_phone', event: 'Find Phone Number', fields: [['Work Email', '{{1. Email Value}}'], ['Full Name', '{{1. Name}}'], ['Company Name', '{{1. Organization Name}}']] },
      { app: 'Pipedrive', event: 'Update Person', fields: [['Person', '{{1. ID}}'], ['Phone', '{{2. Phone}}']] },
    ],
    cost: 'from $0.0048 per number found',
  },
  {
    slug: 'daily-google-results-to-slack',
    title: 'Get daily Slack messages with Google results for a keyword from looot',
    description: 'Watching where your site and your competitors show up on Google is easy to forget. Every morning, looot runs a Google search for the keyword you choose and posts the top results to a Slack channel, so the team sees changes without opening a rank tracker. Each search costs about a tenth of a cent. *Note: set the keyword and country in the looot step.*',
    steps: [
      { app: 'Schedule by Zapier', event: 'Every Day', fields: [['Time of Day', '8am'], ['Trigger on Weekends?', 'no']] },
      { app: LOOOT, key: 'search_google', event: 'Search Google', fields: [['Query', 'leave empty'], ['Country', 'leave empty']] },
      { app: 'Slack', event: 'Send Channel Message', fields: [['Channel', 'leave empty'], ['Message Text', 'Google results for "{{2. Query}}" today:\n{{2. Result Organic Title}}\n{{2. Result Organic Link}}']] },
    ],
    cost: 'about $0.0009 per day',
  },
  {
    slug: 'daily-company-news-to-slack',
    title: 'Get daily Slack messages with Google News articles about a company from looot',
    description: 'Competitor and account news is useful only when the team sees it the same day. Every morning, looot searches Google News for the company you name and posts the articles to a Slack channel with their titles and links. Each search costs about a tenth of a cent. *Note: put the company name in the Input field of the looot step, as {"query": "Company name"}.*',
    steps: [
      { app: 'Schedule by Zapier', event: 'Every Day', fields: [['Time of Day', '8am']] },
      { app: LOOOT, key: 'run_operation', event: 'Run Operation', fields: [['Endpoint or Job ID', 'job:news.search'], ['Input (JSON)', 'leave empty, the user writes {"query": "<company>"}']] },
      { app: 'Slack', event: 'Send Channel Message', fields: [['Channel', 'leave empty'], ['Message Text', 'News today:\n{{2. Result News Title}}\n{{2. Result News Link}}']] },
    ],
    cost: 'about $0.001 per day',
    risk: 'Run Operation needs the job id typed in, and Zapier lists hardcoded values as a rejection reason. Submit it after the dedicated templates are approved, or ship a Search News action first.',
  },
  {
    slug: 'salesforce-bad-lead-emails-to-slack',
    title: 'Get Slack alerts for new Salesforce leads with undeliverable emails from looot',
    description: 'A lead with a bad email gets worked for days before anyone notices it bounces. When a lead is created in Salesforce, looot checks the email, and leads whose address is invalid are posted to a Slack channel so someone can fix or drop them. Each check costs $0.00145.',
    steps: [
      { app: 'Salesforce', event: 'New Lead', fields: [] },
      { app: LOOOT, key: 'verify_email', event: 'Verify Email', fields: [['Email', '{{1. Email}}']] },
      { app: 'Filter by Zapier', event: 'Only continue if...', fields: [['Condition', '{{2. Email Status}} (Text) Exactly matches invalid']] },
      { app: 'Slack', event: 'Send Channel Message', fields: [['Channel', 'leave empty'], ['Message Text', 'Lead {{1. First Name}} {{1. Last Name}} ({{1. Company}}) has an undeliverable email: {{1. Email}}']] },
    ],
    cost: '$0.00145 per lead',
  },
  {
    slug: 'google-forms-signups-enriched-to-sheets',
    title: 'Save new Google Forms responses to Google Sheets with company data from looot',
    description: 'Event and webinar signups tell you little about who is coming. When someone fills in your Google Form, looot looks up their company from the website they gave, and a row with their answers plus the company\'s industry and size is added to your sheet. A company looot cannot match still gets a row, with the company fields empty. *Note: your form needs a question for the company website.*',
    steps: [
      { app: 'Google Forms', event: 'New Form Response', fields: [['Form', 'leave empty']] },
      { app: LOOOT, key: 'enrich_company', event: 'Enrich Company', fields: [['Company Domain', '{{1. Company website}}']] },
      { app: 'Google Sheets', event: 'Create Spreadsheet Row', fields: [['Spreadsheet', 'leave empty'], ['Worksheet', 'leave empty'], ['Name', '{{1. Name}}'], ['Email', '{{1. Email}}'], ['Company', '{{2. Company Name}}'], ['Industry', '{{2. Industry}}'], ['Size', '{{2. Company Size}}']] },
    ],
    cost: 'from $0.0019 per response',
  },
  {
    slug: 'airtable-linkedin-to-work-emails',
    title: 'Add work emails to new Airtable records from LinkedIn profile URLs with looot',
    description: 'Prospect lists built from LinkedIn have profile links but no emails. When a record with a LinkedIn profile URL is added to your Airtable base, looot finds the person\'s work email and writes it and its check result to the record. Only lookups that ran are charged.',
    steps: [
      { app: 'Airtable', event: 'New Record', fields: [['Base', 'leave empty'], ['Table', 'leave empty']] },
      { app: LOOOT, key: 'find_work_email', event: 'Find Work Email', fields: [['LinkedIn Profile URL', '{{1. LinkedIn URL}}']] },
      { app: 'Airtable', event: 'Update Record', fields: [['Base', 'leave empty'], ['Table', 'leave empty'], ['Record', '{{1. ID}}'], ['Email', '{{2. Email}}'], ['Email Check', '{{2. Email Check}}']] },
    ],
    cost: 'from $0.0036 per email found',
  },
  {
    slug: 'looot-runs-to-sheets',
    title: 'Create Google Sheets rows for finished looot runs',
    description: 'Data spend is hard to follow when several tools share one balance. Each time a run in your looot workspace finishes, a row with the endpoint, the provider that answered, the status and the cost is added to your sheet. The log itself costs nothing.',
    steps: [
      { app: LOOOT, key: 'run_finished', event: 'Run Finished', fields: [] },
      { app: 'Google Sheets', event: 'Create Spreadsheet Row', fields: [['Spreadsheet', 'leave empty'], ['Worksheet', 'leave empty'], ['Run ID', '{{1. Run ID}}'], ['Endpoint', '{{1. Endpoint ID}}'], ['Provider', '{{1. Provider}}'], ['Status', '{{1. Status}}'], ['Cost', '{{1. Cost (USD)}}'], ['Completed', '{{1. Completed At}}']] },
    ],
    cost: 'free',
  },
];

module.exports = { ZAPS, LOOOT };
