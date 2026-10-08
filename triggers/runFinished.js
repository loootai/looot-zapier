'use strict';

const { BASE_URL, TERMINAL_STATUSES } = require('../lib/client');

// GET /v1/runs returns { nextCursor, runs: [...] }, newest first, as bounded summaries
// (no result payload). The trigger keeps the runs that reached a terminal status.
const perform = async (z, bundle) => {
  const response = await z.request({ url: `${BASE_URL}/v1/runs`, params: { limit: 50 } });
  const runs = (response.data && response.data.runs) || [];
  const wanted = bundle.inputData.status ? [bundle.inputData.status] : TERMINAL_STATUSES;
  return runs.filter((run) => wanted.includes(run.status)).map((run) => ({ id: run.runId, ...run }));
};

module.exports = {
  key: 'run_finished',
  noun: 'Run',
  display: {
    label: 'Run Finished',
    description: 'Triggers when a run in your workspace reaches a final status.',
  },
  operation: {
    type: 'polling',
    inputFields: [
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        choices: { completed: 'Completed', failed: 'Failed', blocked: 'Blocked', stopped: 'Stopped' },
        helpText: 'Leave empty to trigger on every final status.',
      },
    ],
    perform,
    sample: {
      id: 'run_01J9ZK2Q7W8X',
      runId: 'run_01J9ZK2Q7W8X',
      endpointId: 'job:people.email.verify',
      providerId: 'icypeas',
      status: 'completed',
      createdAt: '2026-10-08T10:00:00.000Z',
      completedAt: '2026-10-08T10:00:02.000Z',
      actualCost: 0.00145,
      resultBytes: 212,
    },
    outputFields: [
      { key: 'id', label: 'Run ID' },
      { key: 'endpointId', label: 'Endpoint ID' },
      { key: 'providerId', label: 'Provider' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
      { key: 'completedAt', label: 'Completed At', type: 'datetime' },
      { key: 'actualCost', label: 'Cost (USD)', type: 'number' },
      { key: 'resultBytes', label: 'Result Size (Bytes)', type: 'integer' },
    ],
  },
};
