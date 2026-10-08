'use strict';

const { runOperation } = require('../lib/client');
const { sharedRunFields, runOutputFields } = require('../lib/runFields');

const JOB_ID = 'job:people.email.verify';

const perform = async (z, bundle) => {
  const run = await runOperation(z, bundle, {
    endpointId: JOB_ID,
    input: { email: String(bundle.inputData.email).trim() },
    idempotencyKey: bundle.inputData.idempotency_key,
    wait: bundle.inputData.wait,
    fallback: bundle.inputData.fallback,
    maxCostUsd: bundle.inputData.max_cost_usd,
  });
  return {
    ...run,
    email: run.fields.email || String(bundle.inputData.email).trim(),
    email_status: run.fields.status || null,
    deliverable: run.fields.deliverable === undefined ? null : run.fields.deliverable,
  };
};

module.exports = {
  key: 'verify_email',
  noun: 'Email Verification',
  display: {
    label: 'Verify Email',
    description: 'Checks whether an email address is deliverable before you send to it.',
  },
  operation: {
    inputFields: [
      { key: 'email', label: 'Email', type: 'string', required: true, placeholder: 'jane.doe@example.com' },
      ...sharedRunFields,
    ],
    perform,
    sample: {
      id: 'run_01J9ZK2Q7W8X',
      runId: 'run_01J9ZK2Q7W8X',
      status: 'completed',
      endpointId: 'job:people.email.verify',
      actualCost: 0.00145,
      email: 'jane.doe@example.com',
      email_status: 'valid',
      deliverable: true,
      fields: { email: 'jane.doe@example.com', status: 'valid', deliverable: true },
    },
    outputFields: [
      { key: 'email', label: 'Email' },
      { key: 'email_status', label: 'Email Status' },
      { key: 'deliverable', label: 'Deliverable', type: 'boolean' },
      ...runOutputFields,
    ],
  },
};
