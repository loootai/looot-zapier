'use strict';

const { BASE_URL } = require('./lib/client');

/** Reads the balance, the cheapest free call that proves the token works. */
const testAuth = async (z) => {
  const response = await z.request({ url: `${BASE_URL}/v1/balance` });
  return response.data;
};

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'api_key',
      label: 'Agent Token',
      type: 'password',
      required: true,
      helpText:
        'Create a token in the [looot dashboard](https://looot.ai) under Settings, Agent tokens. Tick catalog.read, runs.read, runs.execute and usage.read.',
    },
  ],
  test: testAuth,
};
