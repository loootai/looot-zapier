'use strict';

const { runOperation, parseInput } = require('../lib/client');
const { sharedRunFields, runOutputFields } = require('../lib/runFields');
const { buildInput, endpointChoices, endpointInputFields, readOperation, unknownEndpoint } = require('../lib/endpointFields');

const perform = async (z, bundle) => {
  const data = bundle.inputData;
  const endpointId = String(data.endpoint_id || '').trim();
  if (!endpointId) {
    throw new z.errors.Error('Pick an endpoint in the "Endpoint" field. Use Find Operations in Catalog to look one up.', 'missing_endpoint', 400);
  }
  let schema = null;
  if (!endpointId.startsWith('job:')) {
    const operation = await readOperation(z, endpointId);
    if (!operation) throw unknownEndpoint(z, endpointId);
    schema = operation.inputSchema;
  }
  return runOperation(z, bundle, {
    endpointId,
    input: buildInput(data, schema, parseInput(z, data.input)),
    idempotencyKey: data.idempotency_key,
    wait: data.wait,
    fallback: data.fallback,
    maxCostUsd: data.max_cost_usd,
  });
};

module.exports = {
  key: 'run_endpoint',
  noun: 'Run',
  display: {
    label: 'Run Endpoint',
    description: 'Runs one endpoint picked from a list, with its own input fields, and spends prepaid credit only when the run succeeds.',
  },
  operation: {
    inputFields: [
      {
        key: 'search_words',
        label: 'Search Words',
        type: 'string',
        helpText: 'Optional. Type what you want to do, for example "find work email", to narrow the Endpoint list.',
      },
      {
        key: 'endpoint_id',
        label: 'Endpoint',
        required: true,
        dependsOn: ['search_words'],
        altersDynamicFields: true,
        choices: { perform: endpointChoices },
        helpText: 'The endpoint to run. The price per call shows next to each name. You can also map an endpoint ID, or a job written as `job:people.email.find` to let looot pick the provider.',
      },
      endpointInputFields,
      {
        key: 'input',
        label: 'Input (JSON)',
        type: 'text',
        helpText: 'Optional. A JSON object such as `{"domain": "example.com"}`. Use it when an endpoint shows no fields above, or for a job. Values here win over the fields above.',
      },
      ...sharedRunFields,
    ],
    perform,
    sample: {
      id: 'run_01J9ZK2Q7W8X',
      runId: 'run_01J9ZK2Q7W8X',
      status: 'completed',
      endpointId: 'tomba-email-finder',
      actualCost: 0.0089,
      result: { email: 'jane.doe@example.com', score: 96 },
      fields: {},
    },
    outputFields: runOutputFields,
  },
};
