'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const App = require('../index');
const { ZAPS, LOOOT } = require('../templates/zaps');

const modules = { ...App.creates, ...App.searches, ...App.triggers };
const BANNED_STEPS = /^(Code by Zapier|Formatter by Zapier|Paths by Zapier|Webhooks by Zapier|Looping by Zapier)$/;

test('10 to 15 templates with unique slugs and titles', () => {
  assert.ok(ZAPS.length >= 10 && ZAPS.length <= 15);
  assert.equal(new Set(ZAPS.map((z) => z.slug)).size, ZAPS.length);
  assert.equal(new Set(ZAPS.map((z) => z.title)).size, ZAPS.length);
});

for (const z of ZAPS) {
  test(`${z.slug}: title follows Zapier's rules`, () => {
    assert.match(z.title, /^(Add|Create|Get|Send|Save|Update|Find|Post|Log)\b/);
    assert.doesNotMatch(z.title, /\b(sync|automatic|automatically|you|your|we|I)\b/i);
    assert.doesNotMatch(z.title, /—/);
  });

  test(`${z.slug}: description follows Zapier's rules`, () => {
    const d = z.description;
    assert.doesNotMatch(d, /https?:|www\.|\b(zap|zaps|trigger|triggers|action|actions|sync)\b/i);
    assert.doesNotMatch(d, /—/);
    const body = d.replace(/\*Note:.*\*$/, '').trim();
    const sentences = body.split(/(?<=[.!?])\s+/).filter(Boolean);
    assert.ok(sentences.length >= 2 && sentences.length <= 4, `${sentences.length} sentences`);
    if (d.includes('Note:')) assert.match(d, /\*Note: [^*]+\*$/);
    assert.ok(!ZAPS.some((o) => o !== z && o.description === d), 'unique description');
  });

  test(`${z.slug}: steps are allowed and looot fields exist`, () => {
    assert.ok(z.steps.length >= 2 && z.steps.length <= 5);
    assert.ok(z.steps.some((s) => s.app === LOOOT), 'uses looot');
    z.steps.forEach((s, i) => {
      assert.doesNotMatch(s.app, BANNED_STEPS);
      if (s.app !== LOOOT) return;
      const m = modules[s.key];
      assert.ok(m, `looot has ${s.key}`);
      assert.equal(m.display.label, s.event);
      if (i === 0) assert.ok(App.triggers[s.key], 'a first looot step is a trigger');
      const labels = new Set((m.operation.inputFields || []).map((f) => f.label));
      for (const [field] of s.fields) assert.ok(labels.has(field), `${s.key} has input ${field}`);
      const outLabels = new Set((m.operation.outputFields || []).map((f) => f.label));
      // later steps that map from this one use its output labels (or nested result fields)
      z.steps.slice(i + 1).forEach((later) => {
        for (const [, v] of later.fields) {
          for (const [, label] of v.matchAll(new RegExp(`\\{\\{${i + 1}\\. ([^}]+)\\}\\}`, 'g'))) {
            assert.ok(outLabels.has(label) || label.startsWith('Result ') || label === 'Query', `${s.key} outputs ${label}`);
          }
        }
      });
    });
  });
}
