'use strict';

const { MAX_WAIT_SECONDS, DEFAULT_WAIT_SECONDS } = require('./client');

/** Input fields every run action shares: fallback, cost cap, wait and the idempotency key. */
const sharedRunFields = [
  {
    key: 'fallback',
    label: 'Try Other Providers',
    type: 'boolean',
    default: 'true',
    helpText: 'When the first provider finds nothing, try the next provider of the same job. Only the attempts that ran are charged. Works with job IDs only.',
  },
  {
    key: 'max_cost_usd',
    label: 'Max Cost (USD)',
    type: 'number',
    helpText: 'The most this step may spend across all providers it tries, for example 0.1. Leave empty for the default cap. Used only when Try Other Providers is on.',
  },
  {
    key: 'wait',
    label: 'Wait (Seconds)',
    type: 'integer',
    default: String(DEFAULT_WAIT_SECONDS),
    helpText: `How long to wait for the result, from 0 to ${MAX_WAIT_SECONDS}. A run that takes longer comes back with status queued or running; read it later with Find Run.`,
  },
  {
    key: 'idempotency_key',
    label: 'Idempotency Key',
    type: 'string',
    helpText: 'The same key with the same input never pays twice. Leave empty and the step builds one from the Zap, the input and the date. Map a record ID from your trigger to control it yourself.',
  },
];

const runOutputFields = [
  { key: 'id', label: 'Run ID' },
  { key: 'status', label: 'Status' },
  { key: 'endpointId', label: 'Endpoint ID' },
  { key: 'servedProviderId', label: 'Provider That Answered' },
  { key: 'outcome', label: 'Outcome' },
  { key: 'actualCost', label: 'Cost (USD)', type: 'number' },
  { key: 'replayed', label: 'Replayed', type: 'boolean' },
];

module.exports = { sharedRunFields, runOutputFields };
