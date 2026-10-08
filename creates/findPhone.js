'use strict';

const { runOperation, removeEmpty } = require('../lib/client');
const { sharedRunFields, runOutputFields } = require('../lib/runFields');

const JOB_ID = 'job:people.phone.find';

const perform = async (z, bundle) => {
  const input = removeEmpty({
    first_name: bundle.inputData.first_name,
    last_name: bundle.inputData.last_name,
    name: bundle.inputData.full_name,
    domain: bundle.inputData.domain,
    company: bundle.inputData.company,
    linkedin_url: bundle.inputData.linkedin_url,
    email: bundle.inputData.email,
  });
  if (!input.linkedin_url && !input.email && !(input.name || (input.first_name && input.last_name))) {
    throw new z.errors.Error('Give a LinkedIn URL, a work email, or a name with a company.', 'missing_person', 400);
  }
  const run = await runOperation(z, bundle, {
    endpointId: JOB_ID,
    input,
    idempotencyKey: bundle.inputData.idempotency_key,
    wait: bundle.inputData.wait,
    fallback: bundle.inputData.fallback,
    maxCostUsd: bundle.inputData.max_cost_usd,
  });
  return { ...run, phone: run.fields.phone || null };
};

module.exports = {
  key: 'find_phone',
  noun: 'Phone Number',
  display: {
    label: 'Find Phone Number',
    description: 'Finds a phone number for a person from their LinkedIn URL, work email, or name and company.',
  },
  operation: {
    inputFields: [
      { key: 'linkedin_url', label: 'LinkedIn Profile URL', type: 'string', helpText: 'Most phone providers match on this field.' },
      { key: 'email', label: 'Work Email', type: 'string' },
      { key: 'first_name', label: 'First Name', type: 'string' },
      { key: 'last_name', label: 'Last Name', type: 'string' },
      { key: 'full_name', label: 'Full Name', type: 'string', helpText: 'Use this when the name is in one field. Not needed with First Name and Last Name.' },
      { key: 'domain', label: 'Company Domain', type: 'string', placeholder: 'example.com', helpText: 'A full URL also works; looot keeps the host.' },
      { key: 'company', label: 'Company Name', type: 'string', helpText: 'Use this when you have no domain.' },
      ...sharedRunFields,
    ],
    perform,
    sample: {
      id: 'run_01J9ZK2Q7W8X',
      runId: 'run_01J9ZK2Q7W8X',
      status: 'completed',
      endpointId: 'job:people.phone.find',
      actualCost: 0.00483,
      phone: '+14155550100',
      fields: { phone: '+14155550100' },
    },
    outputFields: [
      { key: 'phone', label: 'Phone' },
      ...runOutputFields,
    ],
  },
};
