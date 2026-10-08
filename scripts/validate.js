'use strict';

// Runs the same schema check `zapier validate` runs locally (the core package's `validate`
// command), with no Zapier login. Exits 1 and prints each error when the app is not valid.
const createLambdaHandler = require('zapier-platform-core/src/tools/create-lambda-handler');
const app = require('../index');

createLambdaHandler(app)({ command: 'validate' })
  .then((response) => {
    const errors = response.results || [];
    if (errors.length > 0) {
      for (const error of errors) console.error(`${error.property}: ${error.message}`);
      console.error(`${errors.length} schema error(s)`);
      process.exit(1);
    }
    const count = (group) => Object.keys(app[group] || {}).length;
    console.log(`schema valid: ${count('triggers')} trigger, ${count('searches')} searches, ${count('creates')} creates, platform ${app.platformVersion}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
