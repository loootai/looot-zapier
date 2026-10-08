'use strict';

const { runOperation, removeEmpty } = require('../lib/client');
const { sharedRunFields, runOutputFields } = require('../lib/runFields');

const JOB_ID = 'job:company.enrich';

const perform = async (z, bundle) => {
  const input = removeEmpty({ domain: bundle.inputData.domain, name: bundle.inputData.company_name });
  if (!input.domain && !input.name) {
    throw new z.errors.Error('Give a company domain or a company name.', 'missing_company', 400);
  }
  const run = await runOperation(z, bundle, {
    endpointId: JOB_ID,
    input,
    idempotencyKey: bundle.inputData.idempotency_key,
    wait: bundle.inputData.wait,
    fallback: bundle.inputData.fallback,
    maxCostUsd: bundle.inputData.max_cost_usd,
  });
  return {
    ...run,
    company_name: run.fields.name || null,
    company_domain: run.fields.domain || null,
    industry: run.fields.industry || null,
    size: run.fields.size || null,
  };
};

module.exports = {
  key: 'enrich_company',
  noun: 'Company',
  display: {
    label: 'Enrich Company',
    description: 'Gets the name, industry and size of a company from its domain or name.',
  },
  operation: {
    inputFields: [
      { key: 'domain', label: 'Company Domain', type: 'string', placeholder: 'example.com', helpText: 'A full URL also works; looot keeps the host.' },
      { key: 'company_name', label: 'Company Name', type: 'string', helpText: 'Use this when you have no domain.' },
      ...sharedRunFields,
    ],
    perform,
    sample: {
      id: 'run_01J9ZK2Q7W8X',
      runId: 'run_01J9ZK2Q7W8X',
      status: 'completed',
      endpointId: 'job:company.enrich',
      actualCost: 0.0019,
      company_name: 'Example Inc',
      company_domain: 'example.com',
      industry: 'Software',
      size: '51-200',
      fields: { name: 'Example Inc', domain: 'example.com', industry: 'Software', size: '51-200' },
    },
    outputFields: [
      { key: 'company_name', label: 'Company Name' },
      { key: 'company_domain', label: 'Company Domain' },
      { key: 'industry', label: 'Industry' },
      { key: 'size', label: 'Company Size' },
      ...runOutputFields,
    ],
  },
};
