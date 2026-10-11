'use strict';

const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const nock = require('nock');
const zapier = require('zapier-platform-core');

const App = require('../index');
const { fieldsFromSchema, buildInput, toSentenceCase } = require('../lib/endpointFields');

const appTester = zapier.createAppTester(App);
const API = 'https://api.looot.ai';
const authData = { api_key: 'test-token' };
const bundleMeta = { zap: { id: '42' } };
const bearer = { reqheaders: { authorization: 'Bearer test-token' } };

nock.disableNetConnect();
beforeEach(() => nock.cleanAll());
after(() => nock.enableNetConnect());

// Zapier's tester wraps a thrown error as JSON in the message.
const textOf = (error) => {
  try {
    return JSON.parse(error.message).message;
  } catch {
    return error.message;
  }
};
const rejectsWith = (promise, pattern) =>
  assert.rejects(promise, (error) => pattern.test(textOf(error)) || assert.fail(`message was: ${textOf(error)}`));

const run = App.creates.run_endpoint.operation;
const choices = run.inputFields[1].choices.perform;
const dynamicFields = run.inputFields[2];

const tombaSchema = {
  type: 'object',
  required: ['domain'],
  properties: {
    domain: { type: 'string', description: 'Company domain, for example example.com. Send domain or company.' },
    first_name: { type: 'string' },
    limit: { type: 'integer' },
    verified: { type: 'boolean' },
    mode: { enum: ['fast', 'deep'] },
    tags: { type: 'array' },
    filters: { type: 'object' },
    fallback: { type: 'string', description: 'Clashes with a Run Endpoint field name.' },
  },
};

test('Find Operations in Catalog reads the endpoints key the live API sends', async () => {
  nock(API).get('/v1/catalog/search').query({ q: 'email', limit: '10' }).reply(200, {
    endpoints: [{ endpointId: 'tomba-email-finder', provider: 'Tomba' }],
  });
  const rows = await appTester(App.searches.search_catalog.operation.perform, { authData, inputData: { query: 'email' } });
  assert.deepEqual(rows.map((r) => r.id), ['tomba-email-finder']);
});

test('Check Balance reads GET /v1/balance with the bearer token', async () => {
  const scope = nock(API, bearer).get('/v1/balance').reply(200, {
    workspaceId: 'w1', currency: 'USD', available: 18.16, reserved: 0, recentSpendMicros: 2000000,
    topUpLink: { dashboardUrl: 'https://looot.ai/usage?top_up=1' },
  });
  const r = await appTester(App.creates.check_balance.operation.perform, { authData });
  assert.deepEqual([r.available_usd, r.recent_spend_usd, r.top_up_url], [18.16, 2, 'https://looot.ai/usage?top_up=1']);
  assert.ok(scope.isDone());
});

test('endpoint dropdown without search words lists runnable endpoints with prices and pages by cursor', async () => {
  nock(API, bearer).get('/v1/catalog/endpoints').query({ limit: '50', cursor: 'c1' }).reply(200, {
    endpoints: [
      { endpointId: 'a', name: 'A', price: { estimateFormula: '$0.01 per call' }, runnableNow: true },
      { endpointId: 'b', name: 'B', runnableNow: false },
    ],
    nextCursor: 'c2',
  });
  const r = await appTester(choices, { authData, inputData: {}, meta: { paging_token: 'c1' } });
  assert.deepEqual(r.results, [{ id: 'a', label: 'A | $0.01 per call' }]);
  assert.equal(r.paging_token, 'c2');
});

test('endpoint dropdown with search words uses catalog search and offset paging', async () => {
  nock(API, bearer).get('/v1/catalog/search').query({ q: 'email', limit: '25', offset: '0' }).reply(200, {
    endpoints: [{ endpointId: 'a', name: 'A', price: { perCall: 0.5 }, runnableNow: true }],
    nextOffset: 25,
  });
  const r = await appTester(choices, { authData, inputData: { search_words: 'email' }, meta: {} });
  assert.equal(r.results[0].label, 'A | $0.5 per call');
  assert.equal(r.paging_token, '25');
});

test('dynamic input fields come from the endpoint inputSchema', async () => {
  nock(API, bearer).get('/v1/operations/tomba-email-finder').reply(200, { inputSchema: tombaSchema });
  const fields = await appTester(dynamicFields, { authData, inputData: { endpoint_id: 'tomba-email-finder' } });
  assert.deepEqual([fields[0].key, fields[0].required, fields[0].label], ['domain', true, 'Domain']);
  assert.equal(fields.find((f) => f.key === 'limit').type, 'integer');
  assert.equal(fields.find((f) => f.key === 'verified').type, 'boolean');
  assert.deepEqual(fields.find((f) => f.key === 'mode').choices.map((c) => c.value), ['fast', 'deep']);
  assert.equal(fields.find((f) => f.key === 'tags').list, true);
  assert.equal(fields.find((f) => f.key === 'filters').type, 'text');
  assert.ok(fields.find((f) => f.key === 'input_fallback'), 'a clashing name gets an input_ prefix');
});

test('dynamic input fields are empty before an endpoint is picked and for a job id', async () => {
  assert.deepEqual(await appTester(dynamicFields, { authData, inputData: {} }), []);
  assert.deepEqual(await appTester(dynamicFields, { authData, inputData: { endpoint_id: 'job:people.email.find' } }), []);
});

test('Run Endpoint posts the endpoint, the built input, wait, the fallback cap and a stable key', async () => {
  nock(API).get('/v1/operations/tomba-email-finder').reply(200, { inputSchema: tombaSchema });
  let sent;
  nock(API, bearer)
    .post('/v1/runs', (body) => { sent = body; return true; })
    .reply(201, { runId: 'run_1', status: 'completed', actualCost: 0.0089, result: { email: 'a@example.com' } });
  const out = await appTester(run.perform, {
    authData,
    meta: bundleMeta,
    inputData: {
      endpoint_id: 'tomba-email-finder', domain: 'example.com', first_name: 'Jane', filters: '{"a":1}',
      tags: ['x', 'y'], input_fallback: 'z', wait: 10, fallback: true, max_cost_usd: 0.05,
    },
  });
  assert.equal(sent.endpointId, 'tomba-email-finder');
  assert.deepEqual(sent.input, { domain: 'example.com', first_name: 'Jane', filters: { a: 1 }, tags: ['x', 'y'], fallback: 'z' });
  assert.equal(sent.wait, 10);
  assert.deepEqual(sent.fallback, { enabled: true, maxCostUsd: 0.05 });
  assert.match(sent.idempotencyKey, /^zapier-[0-9a-f]{40}$/);
  assert.equal(out.id, 'run_1');
});

test('Run Endpoint keeps the idempotency key the user gave', async () => {
  nock(API).get('/v1/operations/e').reply(200, { inputSchema: { properties: {} } });
  let sent;
  nock(API).post('/v1/runs', (b) => { sent = b; return true; }).reply(201, { runId: 'r', status: 'completed' });
  await appTester(run.perform, { authData, inputData: { endpoint_id: 'e', idempotency_key: 'mine-1' } });
  assert.equal(sent.idempotencyKey, 'mine-1');
});

test('Run Endpoint with a job id and Input (JSON) skips the schema read', async () => {
  let sent;
  nock(API).post('/v1/runs', (b) => { sent = b; return true; }).reply(201, { runId: 'run_2', status: 'completed' });
  await appTester(run.perform, { authData, inputData: { endpoint_id: 'job:people.email.find', input: '{"domain":"example.com"}' } });
  assert.deepEqual(sent.input, { domain: 'example.com' });
  assert.equal(sent.endpointId, 'job:people.email.find');
});

test('Input (JSON) wins over a field with the same name', () => {
  assert.deepEqual(buildInput({ domain: 'a.com' }, tombaSchema, { domain: 'b.com' }), { domain: 'b.com' });
});

test('Run Endpoint without an endpoint, or with an unknown one, says what to do', async () => {
  await rejectsWith(appTester(run.perform, { authData, inputData: {} }), /Pick an endpoint/);
  nock(API).get('/v1/operations/nope').reply(404, { error: { code: 'endpoint_not_found' } });
  await rejectsWith(appTester(run.perform, { authData, inputData: { endpoint_id: 'nope' } }), /no endpoint "nope"/);
});

test('a 400 names the field, a failed run inside a 201 names the field and the cost', async () => {
  nock(API).get('/v1/operations/e').reply(200, { inputSchema: { properties: {} } });
  nock(API).post('/v1/runs').reply(400, { error: { code: 'validation_error', message: 'email is required', field: 'email' } });
  await rejectsWith(appTester(run.perform, { authData, inputData: { endpoint_id: 'e' } }), /email is required.*Check the "email" field/);
  nock(API).get('/v1/operations/e').reply(200, { inputSchema: { properties: {} } });
  nock(API).post('/v1/runs').reply(201, { runId: 'r', status: 'failed', error: { code: 'validation_error', message: 'domain is required', field: 'domain' } });
  await rejectsWith(appTester(run.perform, { authData, inputData: { endpoint_id: 'e' } }), /domain is required.*Check the "domain" field.*costs nothing/);
});

test('403 names the scopes, 409 names the idempotency key, 500 asks to try again', async () => {
  nock(API).get('/v1/balance').reply(403, { error: { code: 'forbidden', message: 'Missing scope usage.read.' } });
  await rejectsWith(appTester(App.creates.check_balance.operation.perform, { authData }), /catalog\.read, runs\.read, runs\.execute and usage\.read/);
  nock(API).get('/v1/balance').reply(409, { error: { code: 'idempotency_conflict', message: 'Different body.' } });
  await rejectsWith(appTester(App.creates.check_balance.operation.perform, { authData }), /Idempotency Key was already used/);
  nock(API).get('/v1/balance').reply(503, 'oops');
  await rejectsWith(appTester(App.creates.check_balance.operation.perform, { authData }), /Try again in a minute/);
});

test('the 402 message keeps the top-up link', async () => {
  nock(API).get('/v1/operations/e').reply(200, { inputSchema: { properties: {} } });
  nock(API).post('/v1/runs').reply(402, { error: { code: 'insufficient_balance', message: 'Not enough balance.' }, topUp: { dashboardUrl: 'https://looot.ai/usage?top_up=1' } });
  await rejectsWith(appTester(run.perform, { authData, inputData: { endpoint_id: 'e' } }), /Nothing was charged.*top_up=1/);
});

test('field helpers sort required fields first and write sentence-case labels', () => {
  assert.equal(toSentenceCase('first_name'), 'First name');
  assert.equal(toSentenceCase('companyDomain'), 'Company domain');
  assert.equal(fieldsFromSchema(tombaSchema)[0].required, true);
});
