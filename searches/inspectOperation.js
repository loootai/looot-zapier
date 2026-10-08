'use strict';

const { BASE_URL } = require('../lib/client');

const perform = async (z, bundle) => {
  const endpointId = String(bundle.inputData.endpoint_id).trim();
  const response = await z.request({
    url: `${BASE_URL}/v1/operations/${encodeURIComponent(endpointId)}`,
    skipThrowForStatus: true,
  });
  if (response.status === 404) return [];
  return [{ id: endpointId, ...response.data }];
};

module.exports = {
  key: 'inspect_operation',
  noun: 'Operation',
  display: {
    label: 'Find Operation Details',
    description: 'Reads the exact inputs, output and price of one endpoint or job. Free.',
  },
  operation: {
    inputFields: [
      {
        key: 'endpoint_id',
        label: 'Endpoint or Job ID',
        type: 'string',
        required: true,
        placeholder: 'job:people.email.find',
        helpText: 'An endpoint ID from Find Operations in Catalog, or a job written as `job:<job id>`.',
      },
    ],
    perform,
    sample: { id: 'job:people.email.find' },
    outputFields: [{ key: 'id', label: 'Endpoint or Job ID' }],
  },
};
