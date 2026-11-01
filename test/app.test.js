'use strict';

const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const nock = require('nock');
const zapier = require('zapier-platform-core');

const App = require('../index');
const { buildIdempotencyKey, toStableJson, clampWait, isOn } = require('../lib/client');

const appTester = zapier.createAppTester(App);
const API = 'https://api.looot.ai';
const authData = { api_key: 'test-token' };
const bundleMeta = { zap: { id: '42' } };

nock.disableNetConnect();
beforeEach(() => nock.cleanAll());
after(() => nock.enableNetConnect());

test('auth test reads GET /v1/balance with the bearer token', async () => {
  const scope = nock(API, { reqheaders: { authorization: 'Bearer test-token' } })
    .get('/v1/balance')
    .reply(200, { workspaceId: 'ws_1', currency: 'USD', available: 4.2 });
  const result = await appTester(App.authentication.test, { authData });
  assert.equal(result.available, 4.2);
  assert.ok(scope.isDone());
});

test('a 401 asks the user to reconnect', async () => {
  nock(API).get('/v1/balance').reply(401, { error: { code: 'unauthorized', message: 'Valid bearer token required' } });
  await assert.rejects(appTester(App.authentication.test, { authData }), /token is missing or not valid/);
});

test('Find Operations in Catalog sends q, limit and filters and gives each row an id', async () => {
  const scope = nock(API)
    .get('/v1/catalog/search')
    .query({ q: 'verify an email', limit: '5', prefer: 'cheapest', maxPriceMicros: '2000' })
    .reply(200, { items: [{ endpointId: 'icypeas-email-verify', provider: 'icypeas', estimatedPrice: 0.0019 }] });
  const results = await appTester(App.searches.search_catalog.operation.perform, {
    authData,
    inputData: { query: 'verify an email', limit: 5, prefer: 'cheapest', max_price_usd: 0.002 },
  });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'icypeas-email-verify');
  assert.ok(scope.isDone());
});

test('Find Operation Details encodes a job id in the path and returns nothing on 404', async () => {
  nock(API).get('/v1/operations/job%3Apeople.email.find').reply(200, { endpointId: 'job:people.email.find' });
  const found = await appTester(App.searches.inspect_operation.operation.perform, {
    authData,
    inputData: { endpoint_id: 'job:people.email.find' },
  });
  assert.equal(found[0].id, 'job:people.email.find');

  nock(API).get('/v1/operations/nope').reply(404, { error: { code: 'endpoint_not_found', message: 'not found' } });
  const missing = await appTester(App.searches.inspect_operation.operation.perform, {
    authData,
    inputData: { endpoint_id: 'nope' },
  });
  assert.deepEqual(missing, []);
});

test('Run Operation posts endpointId, input, idempotencyKey, wait and the fallback cap', async () => {
  let sent;
  nock(API)
    .post('/v1/runs', (body) => {
      sent = body;
      return true;
    })
    .reply(201, { runId: 'run_1', status: 'completed', actualCost: 0.001, result: { organic: [] } });
  const run = await appTester(App.creates.run_operation.operation.perform, {
    authData,
    meta: bundleMeta,
    inputData: {
      endpoint_id: 'serper-search',
      input: '{"q": "looot"}',
      fallback: true,
      max_cost_usd: 0.05,
      wait: 90,
    },
  });
  assert.equal(sent.endpointId, 'serper-search');
  assert.deepEqual(sent.input, { q: 'looot' });
  assert.match(sent.idempotencyKey, /^zapier-[0-9a-f]{40}$/);
  assert.equal(sent.wait, 25);
  assert.deepEqual(sent.fallback, { enabled: true, maxCostUsd: 0.05 });
  assert.equal(run.id, 'run_1');
  assert.equal(run.actualCost, 0.001);
});

test('Run Operation keeps the key the user gave and leaves fallback out when it is off', async () => {
  let sent;
  nock(API)
    .post('/v1/runs', (body) => {
      sent = body;
      return true;
    })
    .reply(201, { runId: 'run_2', status: 'queued' });
  const run = await appTester(App.creates.run_operation.operation.perform, {
    authData,
    inputData: { endpoint_id: 'serper-search', input: '{}', idempotency_key: ' row-7 ', fallback: false, wait: 0 },
  });
  assert.equal(sent.idempotencyKey, 'row-7');
  assert.equal(sent.wait, 0);
  assert.equal('fallback' in sent, false);
  assert.equal(run.status, 'queued');
});

test('Run Operation refuses input that is not a JSON object', async () => {
  await assert.rejects(
    appTester(App.creates.run_operation.operation.perform, { authData, inputData: { endpoint_id: 'x', input: '[1]' } }),
    /Input must be a JSON object/,
  );
  await assert.rejects(
    appTester(App.creates.run_operation.operation.perform, { authData, inputData: { endpoint_id: 'x', input: '{oops' } }),
    /Input is not valid JSON/,
  );
});

test('a run that comes back failed raises an error with the code and message looot sent', async () => {
  nock(API)
    .post('/v1/runs')
    .reply(201, { runId: 'run_3', status: 'failed', error: { code: 'endpoint_not_found', message: 'No such endpoint' } });
  await assert.rejects(
    appTester(App.creates.run_operation.operation.perform, { authData, inputData: { endpoint_id: 'nope', input: '{}' } }),
    /run_3 ended failed: No such endpoint/,
  );
});

test('a 402 names the top-up page and says nothing was charged', async () => {
  nock(API)
    .post('/v1/runs')
    .reply(402, {
      error: { code: 'insufficient_balance', message: 'Balance too low.' },
      topUp: { dashboardUrl: 'https://looot.ai/billing' },
    });
  await assert.rejects(
    appTester(App.creates.verify_email.operation.perform, { authData, inputData: { email: 'jane.doe@example.com' } }),
    /Balance too low\. Nothing was charged\. Top up at https:\/\/looot\.ai\/billing/,
  );
});

test('a 429 becomes a throttled error', async () => {
  nock(API)
    .post('/v1/runs')
    .reply(429, { error: { code: 'too_many_inflight_runs', message: 'Too many runs in flight' } }, { 'Retry-After': '7' });
  await assert.rejects(
    appTester(App.creates.verify_email.operation.perform, { authData, inputData: { email: 'jane.doe@example.com' } }),
    (error) => error.name === 'ThrottledError',
  );
});

test('Find Work Email runs job:people.email.find and lifts the normalized email', async () => {
  let sent;
  nock(API)
    .post('/v1/runs', (body) => {
      sent = body;
      return true;
    })
    .reply(201, {
      runId: 'run_4',
      status: 'completed',
      actualCost: 0.003598,
      result: { raw: true },
      normalized: { job: 'people.email.find', fields: { email: 'jane.doe@example.com', check: 'valid' } },
    });
  const run = await appTester(App.creates.find_work_email.operation.perform, {
    authData,
    meta: bundleMeta,
    inputData: { first_name: 'Jane', last_name: 'Doe', domain: 'example.com', full_name: '', fallback: true },
  });
  assert.equal(sent.endpointId, 'job:people.email.find');
  assert.deepEqual(sent.input, { first_name: 'Jane', last_name: 'Doe', domain: 'example.com' });
  assert.equal(sent.fallback, true);
  assert.equal(run.email, 'jane.doe@example.com');
  assert.equal(run.check, 'valid');
});

test('Find Work Email gives a null email when the run has no normalized block', async () => {
  nock(API).post('/v1/runs').reply(201, { runId: 'run_5', status: 'completed', result: {} });
  const run = await appTester(App.creates.find_work_email.operation.perform, {
    authData,
    inputData: { full_name: 'Jane Doe', domain: 'example.com' },
  });
  assert.equal(run.email, null);
});

test('Find Work Email splits a full name into first_name and last_name, the names the job takes', async () => {
  let sent;
  nock(API)
    .post('/v1/runs', (body) => {
      sent = body;
      return true;
    })
    .reply(201, { runId: 'run_6', status: 'completed', result: {} });
  await appTester(App.creates.find_work_email.operation.perform, {
    authData,
    inputData: { full_name: '  Grace Brewster Hopper ', domain: 'example.com' },
  });
  assert.deepEqual(sent.input, { first_name: 'Grace', last_name: 'Brewster Hopper', domain: 'example.com' });
});

test('Find Work Email needs a name or a LinkedIn URL', async () => {
  await assert.rejects(
    appTester(App.creates.find_work_email.operation.perform, { authData, inputData: { domain: 'example.com' } }),
    /first and last name, a full name, or a LinkedIn URL/,
  );
});

test('Verify Email runs job:people.email.verify and lifts status and deliverable', async () => {
  let sent;
  nock(API)
    .post('/v1/runs', (body) => {
      sent = body;
      return true;
    })
    .reply(201, {
      runId: 'run_6',
      status: 'completed',
      normalized: { fields: { email: 'jane.doe@example.com', status: 'catch_all', deliverable: false } },
    });
  const run = await appTester(App.creates.verify_email.operation.perform, {
    authData,
    inputData: { email: ' jane.doe@example.com ' },
  });
  assert.equal(sent.endpointId, 'job:people.email.verify');
  assert.deepEqual(sent.input, { email: 'jane.doe@example.com' });
  assert.equal(run.email_status, 'catch_all');
  assert.equal(run.deliverable, false);
});

test('Enrich Company runs job:company.enrich with a domain or a name', async () => {
  let sent;
  nock(API)
    .post('/v1/runs', (body) => {
      sent = body;
      return true;
    })
    .reply(201, {
      runId: 'run_7',
      status: 'completed',
      normalized: { fields: { name: 'Example Inc', domain: 'example.com', industry: 'Software', size: '51-200' } },
    });
  const run = await appTester(App.creates.enrich_company.operation.perform, {
    authData,
    inputData: { domain: 'example.com' },
  });
  assert.equal(sent.endpointId, 'job:company.enrich');
  assert.deepEqual(sent.input, { domain: 'example.com' });
  assert.equal(run.company_name, 'Example Inc');
  assert.equal(run.size, '51-200');
  await assert.rejects(
    appTester(App.creates.enrich_company.operation.perform, { authData, inputData: {} }),
    /company domain or a company name/,
  );
});

test('Find Phone Number runs job:people.phone.find and lifts the normalized phone', async () => {
  let sent;
  nock(API)
    .post('/v1/runs', (body) => {
      sent = body;
      return true;
    })
    .reply(201, {
      runId: 'run_8',
      status: 'completed',
      actualCost: 0.00483,
      normalized: { job: 'people.phone.find', fields: { phone: '+14155550100' } },
    });
  const run = await appTester(App.creates.find_phone.operation.perform, {
    authData,
    meta: bundleMeta,
    inputData: { linkedin_url: 'https://www.linkedin.com/in/jane-doe', first_name: '', email: '' },
  });
  assert.equal(sent.endpointId, 'job:people.phone.find');
  assert.deepEqual(sent.input, { linkedin_url: 'https://www.linkedin.com/in/jane-doe' });
  assert.equal(sent.fallback, true);
  assert.equal(run.phone, '+14155550100');
});

test('Find Phone Number gives a null phone without a normalized block and needs a person', async () => {
  nock(API).post('/v1/runs').reply(201, { runId: 'run_9', status: 'completed', result: {} });
  const run = await appTester(App.creates.find_phone.operation.perform, {
    authData,
    inputData: { full_name: 'Jane Doe', domain: 'example.com' },
  });
  assert.equal(run.phone, null);
  await assert.rejects(
    appTester(App.creates.find_phone.operation.perform, { authData, inputData: { domain: 'example.com' } }),
    /LinkedIn URL, a work email, or a name/,
  );
});

test('Search Google runs job:google.serp.organic with the query and keeps the raw result', async () => {
  let sent;
  nock(API)
    .post('/v1/runs', (body) => {
      sent = body;
      return true;
    })
    .reply(201, {
      runId: 'run_10',
      status: 'completed',
      actualCost: 0.0009,
      result: { organic: [{ position: 1, title: 'Example', link: 'https://example.com' }] },
    });
  const run = await appTester(App.creates.search_google.operation.perform, {
    authData,
    meta: bundleMeta,
    inputData: { query: '  best crm for startups ', country: '' },
  });
  assert.equal(sent.endpointId, 'job:google.serp.organic');
  assert.deepEqual(sent.input, { query: 'best crm for startups' });
  assert.equal(run.query, 'best crm for startups');
  assert.equal(run.result.organic[0].link, 'https://example.com');
});

test('Search Google sends the country when given and refuses an empty query', async () => {
  let sent;
  nock(API)
    .post('/v1/runs', (body) => {
      sent = body;
      return true;
    })
    .reply(201, { runId: 'run_11', status: 'completed', result: {} });
  await appTester(App.creates.search_google.operation.perform, {
    authData,
    inputData: { query: 'coffee', country: 'us' },
  });
  assert.deepEqual(sent.input, { query: 'coffee', country: 'us' });
  await assert.rejects(
    appTester(App.creates.search_google.operation.perform, { authData, inputData: { query: '   ' } }),
    /Give a search query/,
  );
});

test('Find Run reads GET /v1/runs/{id} and returns nothing on 404', async () => {
  nock(API).get('/v1/runs/run_8').reply(200, { runId: 'run_8', status: 'completed', actualCost: 0.002 });
  const found = await appTester(App.searches.get_run.operation.perform, { authData, inputData: { run_id: 'run_8' } });
  assert.equal(found[0].id, 'run_8');
  nock(API).get('/v1/runs/gone').reply(404, { error: { code: 'run_not_found', message: 'not found' } });
  const missing = await appTester(App.searches.get_run.operation.perform, { authData, inputData: { run_id: 'gone' } });
  assert.deepEqual(missing, []);
});

test('Run Finished lists runs and keeps the ones in a final status', async () => {
  const runs = [
    { runId: 'a', status: 'completed' },
    { runId: 'b', status: 'running' },
    { runId: 'c', status: 'failed' },
    { runId: 'd', status: 'queued' },
  ];
  nock(API).get('/v1/runs').query({ limit: '50' }).reply(200, { nextCursor: null, runs });
  const all = await appTester(App.triggers.run_finished.operation.perform, { authData, inputData: {} });
  assert.deepEqual(all.map((run) => run.id), ['a', 'c']);
  nock(API).get('/v1/runs').query({ limit: '50' }).reply(200, { nextCursor: null, runs });
  const failed = await appTester(App.triggers.run_finished.operation.perform, { authData, inputData: { status: 'failed' } });
  assert.deepEqual(failed.map((run) => run.id), ['c']);
});

test('the default idempotency key is stable for the same Zap, input and day', () => {
  const bundle = { meta: { zap: { id: '42' } } };
  const day = new Date('2026-10-08T10:00:00Z');
  const first = buildIdempotencyKey(bundle, 'job:x', { b: 1, a: 2 }, day);
  assert.equal(first, buildIdempotencyKey(bundle, 'job:x', { a: 2, b: 1 }, new Date('2026-10-08T23:59:00Z')));
  assert.notEqual(first, buildIdempotencyKey(bundle, 'job:x', { a: 2, b: 2 }, day));
  assert.notEqual(first, buildIdempotencyKey(bundle, 'job:y', { a: 2, b: 1 }, day));
  assert.notEqual(first, buildIdempotencyKey(bundle, 'job:x', { a: 2, b: 1 }, new Date('2026-10-09T00:00:01Z')));
  assert.notEqual(first, buildIdempotencyKey({ meta: { zap: { id: '43' } } }, 'job:x', { a: 2, b: 1 }, day));
  assert.equal(toStableJson({ b: [1, { d: 1, c: 2 }], a: null }), '{"a":null,"b":[1,{"c":2,"d":1}]}');
});

test('wait is clamped to 0-25 seconds and defaults to 20', () => {
  assert.equal(clampWait(undefined), 20);
  assert.equal(clampWait(''), 20);
  assert.equal(clampWait(-3), 0);
  assert.equal(clampWait(60), 25);
  assert.equal(clampWait('12'), 12);
});

test('the fallback switch reads Zapier booleans and strings, and is on when left empty', () => {
  assert.equal(isOn(undefined), true);
  assert.equal(isOn(''), true);
  assert.equal(isOn(true), true);
  assert.equal(isOn('true'), true);
  assert.equal(isOn(false), false);
  assert.equal(isOn('false'), false);
  assert.equal(isOn('no'), false);
});

test('every trigger, search and create has a sample whose keys cover its output fields', () => {
  for (const group of ['triggers', 'searches', 'creates']) {
    for (const [key, definition] of Object.entries(App[group])) {
      const sample = definition.operation.sample;
      assert.ok(sample && sample.id, `${key} sample has an id`);
    }
  }
});
