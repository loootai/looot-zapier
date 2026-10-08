'use strict';

const { runOperation, parseInput } = require('../lib/client');
const { sharedRunFields, runOutputFields } = require('../lib/runFields');

const perform = async (z, bundle) =>
  runOperation(z, bundle, {
    endpointId: bundle.inputData.endpoint_id,
    input: parseInput(z, bundle.inputData.input),
    idempotencyKey: bundle.inputData.idempotency_key,
    wait: bundle.inputData.wait,
    fallback: bundle.inputData.fallback,
    maxCostUsd: bundle.inputData.max_cost_usd,
  });

module.exports = {
  key: 'run_operation',
  noun: 'Run',
  display: {
    label: 'Run Operation',
    description: 'Runs any endpoint or job from the catalog and spends prepaid credit.',
  },
  operation: {
    inputFields: [
      {
        key: 'endpoint_id',
        label: 'Endpoint or Job ID',
        type: 'string',
        required: true,
        placeholder: 'job:people.email.find',
        helpText: 'An endpoint ID from Find Operations in Catalog, or a job written as `job:<job id>`, for example `job:people.email.find`.',
      },
      {
        key: 'input',
        label: 'Input (JSON)',
        type: 'text',
        required: true,
        default: '{}',
        helpText: 'The input object. Use the field names that Find Operation Details lists for this endpoint or job.',
      },
      ...sharedRunFields,
    ],
    perform,
    sample: {
      id: 'run_01J9ZK2Q7W8X',
      runId: 'run_01J9ZK2Q7W8X',
      status: 'completed',
      endpointId: 'job:people.email.verify',
      actualCost: 0.00145,
      result: { status: 'VALID' },
      fields: { email: 'jane.doe@example.com', status: 'valid', deliverable: true },
    },
    outputFields: runOutputFields,
  },
};
