'use strict';

// Writes templates/<slug>.md (click-by-click spec) and templates/README.md from templates/zaps.js.
//   node templates/render.js
const fs = require('node:fs');
const path = require('node:path');
const { ZAPS, LOOOT } = require('./zaps');

const dir = __dirname;
const stepKind = (i, s) => (i === 0 ? 'Trigger' : s.app === 'Filter by Zapier' ? 'Filter' : 'Action');

const specOf = (z) => {
  const lines = [`# ${z.title}`, '', `Slug: \`${z.slug}\`. Steps: ${z.steps.length}. Usual cost: ${z.cost}.`, ''];
  if (z.before) lines.push(`Same job as [${z.before.label}](${z.before.url}): ${z.before.nodes} n8n nodes and ${z.before.dataAccounts} data API accounts there, ${z.steps.length} Zap steps and 1 data account here.`, '');
  if (z.risk) lines.push(`Review risk: ${z.risk}`, '');
  lines.push('## Title', '', z.title, '', '## Description', '', z.description, '', '## Build it in the Zap template editor', '');
  lines.push('1. Sign in to Zapier with the account that owns the looot integration, then open https://zapier.com/webintent/create-template (or https://developer.zapier.com/zap-templates > Create Zap template).');
  let n = 2;
  z.steps.forEach((s, i) => {
    lines.push(`${n}. ${stepKind(i, s)} ${i + 1}: pick **${s.app === LOOOT ? 'looot' : s.app}**, event **${s.event}**.`);
    for (const [field, value] of s.fields) lines.push(`   - ${field}: ${value.startsWith('{{') || value.includes('{{') ? `map \`${value}\`` : value}`);
    if (!s.fields.length) lines.push('   - no fields to set');
    n += 1;
  });
  lines.push(
    `${n}. Click **Submit**. Paste the title and description above. Click **Save Draft**.`,
    `${n + 1}. From the draft, click **Create Zap**, connect real accounts, and run it once with a real record. The editor cannot test steps itself.`,
    `${n + 2}. If the run worked, open the draft again and click **Submit for Review**. Zapier answers by email in about 2 weeks.`,
    '',
    'Field names of other apps are the ones their Zapier integrations usually show. Pick the closest field the editor offers; leave a field empty rather than typing a value every user would not want.',
    '',
  );
  return lines.join('\n');
};

const readme = () => {
  const rows = ZAPS.map((z) => `| [${z.slug}](${z.slug}.md) | ${z.title} | ${z.steps.map((s) => (s.app === LOOOT ? `looot ${s.event}` : s.app)).join(' > ')} | ${z.cost} | ${z.before ? `${z.before.nodes} n8n nodes, ${z.before.dataAccounts} data accounts / ${z.steps.length} steps, 1` : '-'} |`);
  return `# Zap templates for looot

${ZAPS.length} Zap template specs for the looot Zapier integration. Zapier builds templates in its own editor, not from a file, so each spec has the title, the description and every step with its field mappings, in the order you click them.

Status: specs only. Zap templates can only use an integration that Zapier has published (beta or public), and looot is not pushed to Zapier yet. None of these has run.

| Template | Title | Steps | Usual cost | Before / after |
|---|---|---|---|---|
${rows.join('\n')}

Before and after counts appear only where an n8n gallery template does the same job (counted from its JSON on 2026-10-31, sticky notes not counted). Prices are the cheapest provider in looot's public catalog (\`https://api.looot.ai/v1/catalog/overview?depth=jobs\`) on 2026-10-31.

## Zapier's rules these follow

From https://docs.zapier.com/platform/publish/zap-templates, read 2026-10-31:

- Titles start with a verb, sentence case, plural items, no "sync", "automatic", "you" or "we".
- Descriptions are one paragraph of 2 to 4 sentences that start from the user's goal, with no links and no "Zap", "trigger", "action" or "sync". Setup tips go last, in italics, starting with "Note:".
- No Code, Formatter, Paths, Webhooks or Looping steps. Filters are fine. A search must be followed by an action.
- Leave a field empty unless every user would want the value. Reviews take about 2 weeks; a published template can only be changed by asking Zapier.

\`npm test\` checks the title and description rules and that every looot field in a spec exists in the app.

## Order to submit

Start with the plain two- and three-step ones on popular apps: sheets-rows-to-work-emails, hubspot-companies-enriched, sheets-emails-verified-to-mailchimp, typeform-leads-to-hubspot. Zapier rejects "too many submissions for an integration with low usage", so send 3 or 4 first and the rest after they are approved. daily-company-news-to-slack goes last (see its review risk).

## Rebuild

\`\`\`bash
node templates/render.js
\`\`\`
`;
};

for (const z of ZAPS) fs.writeFileSync(path.join(dir, `${z.slug}.md`), specOf(z));
fs.writeFileSync(path.join(dir, 'README.md'), readme());
console.log(`wrote ${ZAPS.length} specs`);
