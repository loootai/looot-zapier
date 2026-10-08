'use strict';

const { runOperation, removeEmpty } = require('../lib/client');
const { sharedRunFields, runOutputFields } = require('../lib/runFields');

const JOB_ID = 'job:google.serp.organic';

const perform = async (z, bundle) => {
  const query = String(bundle.inputData.query || '').trim();
  if (!query) {
    throw new z.errors.Error('Give a search query.', 'missing_query', 400);
  }
  const run = await runOperation(z, bundle, {
    endpointId: JOB_ID,
    input: removeEmpty({ query, country: bundle.inputData.country }),
    idempotencyKey: bundle.inputData.idempotency_key,
    wait: bundle.inputData.wait,
    fallback: bundle.inputData.fallback,
    maxCostUsd: bundle.inputData.max_cost_usd,
  });
  return { ...run, query };
};

module.exports = {
  key: 'search_google',
  noun: 'Google Search',
  display: {
    label: 'Search Google',
    description: 'Gets the Google results page for a query. The results are in the result field of the run.',
  },
  operation: {
    inputFields: [
      { key: 'query', label: 'Query', type: 'string', required: true, placeholder: 'best crm for startups' },
      { key: 'country', label: 'Country', type: 'string', placeholder: 'us', helpText: 'Two-letter country code. Leave empty for the provider default.' },
      ...sharedRunFields,
    ],
    perform,
    sample: {
      id: 'run_01J9ZK2Q7W8X',
      runId: 'run_01J9ZK2Q7W8X',
      status: 'completed',
      endpointId: 'job:google.serp.organic',
      actualCost: 0.0009,
      query: 'best crm for startups',
    },
    outputFields: [
      { key: 'query', label: 'Query' },
      ...runOutputFields,
    ],
  },
};
