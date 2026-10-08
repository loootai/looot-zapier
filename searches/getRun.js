'use strict';

const { BASE_URL, formatRun } = require('../lib/client');

const perform = async (z, bundle) => {
  const runId = String(bundle.inputData.run_id).trim();
  const response = await z.request({
    url: `${BASE_URL}/v1/runs/${encodeURIComponent(runId)}`,
    skipThrowForStatus: true,
  });
  if (response.status === 404) return [];
  return [formatRun(response.data)];
};

module.exports = {
  key: 'get_run',
  noun: 'Run',
  display: {
    label: 'Find Run',
    description: 'Reads one run by its ID: status, result and cost. Free.',
  },
  operation: {
    inputFields: [
      { key: 'run_id', label: 'Run ID', type: 'string', required: true, helpText: 'The Run ID a run step returned.' },
    ],
    perform,
    sample: {
      id: 'run_01J9ZK2Q7W8X',
      runId: 'run_01J9ZK2Q7W8X',
      status: 'completed',
      endpointId: 'job:people.email.verify',
      actualCost: 0.00145,
      fields: { email: 'jane.doe@example.com', status: 'valid', deliverable: true },
    },
    outputFields: require('../lib/runFields').runOutputFields,
  },
};
