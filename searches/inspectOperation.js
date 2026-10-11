'use strict';

const { BASE_URL } = require('../lib/client');
const { toPriceText } = require('../lib/endpointFields');

const perform = async (z, bundle) => {
  const endpointId = String(bundle.inputData.endpoint_id).trim();
  if (endpointId.startsWith('job:')) {
    // GET /v1/operations/{id} answers 404 for a job id. The catalog search lists the endpoints behind it.
    const listed = await z.request({ url: `${BASE_URL}/v1/catalog/search`, params: { capability: endpointId.slice(4), limit: 20 } });
    const endpoints = (listed.data && listed.data.endpoints) || [];
    if (!endpoints.length) return [];
    return [{
      id: endpointId,
      endpointsInJob: endpoints.map((row) => row.endpointId).join(', '),
      priceText: endpoints.map((row) => toPriceText(row.price)).join(' / '),
      endpoints: endpoints.map((row) => ({ endpointId: row.endpointId, provider: row.provider, price: row.price })),
    }];
  }
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
