'use strict';

const { BASE_URL, removeEmpty } = require('../lib/client');

const perform = async (z, bundle) => {
  const params = removeEmpty({
    q: bundle.inputData.query,
    limit: bundle.inputData.limit || 10,
    category: bundle.inputData.category,
    provider: bundle.inputData.provider,
    prefer: bundle.inputData.prefer,
    maxPriceMicros: bundle.inputData.max_price_usd ? Math.round(Number(bundle.inputData.max_price_usd) * 1e6) : undefined,
  });
  const response = await z.request({ url: `${BASE_URL}/v1/catalog/search`, params });
  const items = (response.data && response.data.items) || [];
  return items.map((item) => ({ id: item.endpointId, ...item }));
};

module.exports = {
  key: 'search_catalog',
  noun: 'Operation',
  display: {
    label: 'Find Operations in Catalog',
    description: 'Searches the catalog for endpoints that do a task, with the price of each. Free.',
  },
  operation: {
    inputFields: [
      { key: 'query', label: 'Query', type: 'string', required: true, placeholder: 'find the work email of a person at a company', helpText: 'What you want to do, in plain words.' },
      { key: 'limit', label: 'Limit', type: 'integer', default: '10', helpText: 'How many results to return, from 1 to 200.' },
      { key: 'prefer', label: 'Order By', type: 'string', choices: { balanced: 'Balanced', cheapest: 'Cheapest', reliable: 'Most Reliable', fastest: 'Fastest' }, default: 'balanced' },
      { key: 'max_price_usd', label: 'Max Price (USD)', type: 'number', helpText: 'Leave out endpoints that cost more than this per call or per result.' },
      { key: 'category', label: 'Category', type: 'string', placeholder: 'enrichment' },
      { key: 'provider', label: 'Provider', type: 'string' },
    ],
    perform,
    sample: {
      id: 'icypeas-email-verify',
      endpointId: 'icypeas-email-verify',
      provider: 'icypeas',
      capability: 'people.email.verify',
      estimatedPrice: 0.0019,
      priceBasis: 'perCall',
    },
    outputFields: [
      { key: 'id', label: 'Endpoint ID' },
      { key: 'provider', label: 'Provider' },
      { key: 'capability', label: 'Job ID' },
      { key: 'estimatedPrice', label: 'Price (USD)', type: 'number' },
      { key: 'priceBasis', label: 'Price Basis' },
    ],
  },
};
