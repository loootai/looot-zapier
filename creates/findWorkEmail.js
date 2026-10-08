'use strict';

const { runOperation, removeEmpty } = require('../lib/client');
const { sharedRunFields, runOutputFields } = require('../lib/runFields');

const JOB_ID = 'job:people.email.find';

const perform = async (z, bundle) => {
  const input = removeEmpty({
    first_name: bundle.inputData.first_name,
    last_name: bundle.inputData.last_name,
    name: bundle.inputData.full_name,
    domain: bundle.inputData.domain,
    company: bundle.inputData.company,
    linkedin_url: bundle.inputData.linkedin_url,
  });
  if (!input.linkedin_url && !(input.name || (input.first_name && input.last_name))) {
    throw new z.errors.Error('Give a first and last name, a full name, or a LinkedIn URL.', 'missing_person', 400);
  }
  const run = await runOperation(z, bundle, {
    endpointId: JOB_ID,
    input,
    idempotencyKey: bundle.inputData.idempotency_key,
    wait: bundle.inputData.wait,
    fallback: bundle.inputData.fallback,
    maxCostUsd: bundle.inputData.max_cost_usd,
  });
  return { ...run, email: run.fields.email || null, check: run.fields.check || null };
};

module.exports = {
  key: 'find_work_email',
  noun: 'Work Email',
  display: {
    label: 'Find Work Email',
    description: 'Finds the work email of a person from their name and company domain.',
  },
  operation: {
    inputFields: [
      { key: 'first_name', label: 'First Name', type: 'string' },
      { key: 'last_name', label: 'Last Name', type: 'string' },
      { key: 'full_name', label: 'Full Name', type: 'string', helpText: 'Use this when the name is in one field. Not needed with First Name and Last Name.' },
      { key: 'domain', label: 'Company Domain', type: 'string', placeholder: 'example.com', helpText: 'A full URL also works; looot keeps the host.' },
      { key: 'company', label: 'Company Name', type: 'string', helpText: 'Use this when you have no domain.' },
      { key: 'linkedin_url', label: 'LinkedIn Profile URL', type: 'string' },
      ...sharedRunFields,
    ],
    perform,
    sample: {
      id: 'run_01J9ZK2Q7W8X',
      runId: 'run_01J9ZK2Q7W8X',
      status: 'completed',
      endpointId: 'job:people.email.find',
      actualCost: 0.003598,
      email: 'jane.doe@example.com',
      check: 'valid',
      fields: { email: 'jane.doe@example.com', check: 'valid' },
    },
    outputFields: [
      { key: 'email', label: 'Email' },
      { key: 'check', label: 'Email Check' },
      ...runOutputFields,
    ],
  },
};
