'use strict';

const { BASE_URL } = require('../lib/client');

const perform = async (z) => {
  const { data } = await z.request({ url: `${BASE_URL}/v1/balance` });
  return {
    id: data.workspaceId,
    currency: data.currency,
    available_usd: data.available,
    reserved_usd: data.reserved,
    recent_spend_usd: data.recentSpendMicros !== undefined ? data.recentSpendMicros / 1e6 : undefined,
    top_up_url: (data.topUpLink && data.topUpLink.dashboardUrl) || 'https://looot.ai/usage?top_up=1',
  };
};

module.exports = {
  key: 'check_balance',
  noun: 'Balance',
  display: {
    label: 'Check Balance',
    description: 'Reads the prepaid balance of the connected account. Free.',
  },
  operation: {
    inputFields: [],
    perform,
    sample: {
      id: '00000000-0000-4000-8000-000000000000',
      currency: 'USD',
      available_usd: 18.16,
      reserved_usd: 0,
      recent_spend_usd: 0,
      top_up_url: 'https://looot.ai/usage?top_up=1',
    },
    outputFields: [
      { key: 'id', label: 'Workspace ID' },
      { key: 'currency', label: 'Currency' },
      { key: 'available_usd', label: 'Available (USD)', type: 'number' },
      { key: 'reserved_usd', label: 'Reserved for Running Calls (USD)', type: 'number' },
      { key: 'recent_spend_usd', label: 'Recent Spend (USD)', type: 'number' },
      { key: 'top_up_url', label: 'Top-Up Link' },
    ],
  },
};
