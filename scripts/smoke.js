'use strict';
// Live, read-only smoke test. GET calls only. It never starts a run (no POST /v1/runs).
// Usage: LOOOT_API_KEY=... node scripts/smoke.js     The key is never printed.
const zapier = require('zapier-platform-core');
const App = require('../index');

const key = process.env.LOOOT_API_KEY || process.env.COSET_LOCAL_TOKEN;
if (!key) {
  console.error('Set LOOOT_API_KEY to a looot token.');
  process.exit(2);
}
const appTester = zapier.createAppTester(App);
const bundle = (inputData = {}, meta = {}) => ({ authData: { api_key: key }, inputData, meta });
const run = App.creates.run_endpoint.operation;
let failed = 0;
let first;
const step = async (name, fn) => {
  try {
    console.log(`ok   ${name}: ${await fn()}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${name}: ${String(error.message).replace(key, '***').slice(0, 300)}`);
  }
};

(async () => {
  await step('auth test', async () => `currency ${(await appTester(App.authentication.test, bundle())).currency}`);
  await step('Check Balance', async () => `available $${(await appTester(App.creates.check_balance.operation.perform, bundle())).available_usd}`);
  await step('Find Operations in Catalog', async () => {
    const rows = await appTester(App.searches.search_catalog.operation.perform, bundle({ query: 'find work email', limit: 5 }));
    first = rows[0];
    if (!first) throw new Error('no rows');
    return `${rows.length} rows, first ${first.id}`;
  });
  await step('Find Operation Details (endpoint)', async () => `${(await appTester(App.searches.inspect_operation.operation.perform, bundle({ endpoint_id: first.id })))[0].id}`);
  await step('Find Operation Details (job:)', async () => `${(await appTester(App.searches.inspect_operation.operation.perform, bundle({ endpoint_id: 'job:people.email.find' })))[0].endpointsInJob.split(', ').length} endpoints`);
  await step('Endpoint dropdown, no search words', async () => `${(await appTester(run.inputFields[1].choices.perform, bundle())).results.length} choices`);
  await step('Endpoint dropdown, search words', async () => `${(await appTester(run.inputFields[1].choices.perform, bundle({ search_words: 'verify email' }))).results.length} choices`);
  await step('Dynamic input fields', async () => (await appTester(run.inputFields[2], bundle({ endpoint_id: first.id }))).map((f) => f.key + (f.required ? '*' : '')).join(', '));
  await step('Run Finished trigger', async () => `${(await appTester(App.triggers.run_finished.operation.perform, bundle())).length} runs`);
  console.log(failed ? `${failed} step(s) failed` : 'all steps passed');
  process.exit(failed ? 1 : 0);
})();
