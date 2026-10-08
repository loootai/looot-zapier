'use strict';

const authentication = require('./authentication');
const { addAuthHeader, handleErrors } = require('./lib/client');

const runFinished = require('./triggers/runFinished');
const searchCatalog = require('./searches/searchCatalog');
const inspectOperation = require('./searches/inspectOperation');
const getRun = require('./searches/getRun');
const runOperation = require('./creates/runOperation');
const findWorkEmail = require('./creates/findWorkEmail');
const verifyEmail = require('./creates/verifyEmail');
const enrichCompany = require('./creates/enrichCompany');
const findPhone = require('./creates/findPhone');
const searchGoogle = require('./creates/searchGoogle');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  // Input arrives as the user typed it; each action drops empty fields itself.
  flags: { cleanInputData: false },
  authentication,
  beforeRequest: [addAuthHeader],
  afterResponse: [handleErrors],
  triggers: { [runFinished.key]: runFinished },
  searches: {
    [searchCatalog.key]: searchCatalog,
    [inspectOperation.key]: inspectOperation,
    [getRun.key]: getRun,
  },
  creates: {
    [runOperation.key]: runOperation,
    [findWorkEmail.key]: findWorkEmail,
    [verifyEmail.key]: verifyEmail,
    [enrichCompany.key]: enrichCompany,
    [findPhone.key]: findPhone,
    [searchGoogle.key]: searchGoogle,
  },
};
