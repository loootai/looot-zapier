'use strict';

const crypto = require('node:crypto');

const BASE_URL = 'https://api.looot.ai';
const TERMINAL_STATUSES = ['completed', 'failed', 'blocked', 'stopped'];
// A Zapier step is cut off after about 30 seconds, so the inline wait stays under that.
const MAX_WAIT_SECONDS = 25;
const DEFAULT_WAIT_SECONDS = 20;

/** Adds the bearer token and the JSON headers to every request. */
const addAuthHeader = (request, z, bundle) => {
  if (bundle.authData && bundle.authData.api_key) {
    request.headers.Authorization = `Bearer ${bundle.authData.api_key}`;
  }
  request.headers.Accept = 'application/json';
  return request;
};

/** Turns a looot error body into a Zapier error with the code and message looot sent. */
const handleErrors = (response, z) => {
  if (response.status < 400) return response;
  // A search that asked to handle a missing record itself gets the 404 back untouched.
  if (response.status === 404 && response.request && response.request.skipThrowForStatus) return response;
  const body = response.data || {};
  const error = body.error || {};
  const message = error.message || `looot answered HTTP ${response.status}`;
  if (response.status === 401) {
    throw new z.errors.ExpiredAuthError('The looot token is missing or not valid. Create one in the looot dashboard under Settings, Agent tokens.');
  }
  if (response.status === 402) {
    const topUpUrl = (body.topUp && body.topUp.dashboardUrl) || 'https://looot.ai';
    throw new z.errors.Error(`${message} Nothing was charged. Top up at ${topUpUrl}`, error.code || 'insufficient_balance', 402);
  }
  if (response.status === 429) {
    const retryAfter = Number(response.getHeader('retry-after')) || 60;
    throw new z.errors.ThrottledError(message, retryAfter);
  }
  throw new z.errors.Error(message, error.code || 'looot_error', response.status);
};

/** Serializes a value with sorted object keys so the same input always gives the same string. */
const toStableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(toStableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${toStableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
};

/**
 * Builds the default idempotency key. Zapier gives an action no run id, so the key is a hash of
 * the Zap id, the endpoint, the input and the UTC date: a retried step replays the same looot run
 * and pays once, and the same lookup on a later day runs fresh.
 */
const buildIdempotencyKey = (bundle, endpointId, input, now = new Date()) => {
  const zapId = (bundle.meta && bundle.meta.zap && bundle.meta.zap.id) || 'no-zap';
  const day = now.toISOString().slice(0, 10);
  const digest = crypto.createHash('sha256').update(`${zapId}|${endpointId}|${toStableJson(input)}|${day}`).digest('hex');
  return `zapier-${digest.slice(0, 40)}`;
};

/** Parses the Input (JSON) field, which Zapier hands over as a string. */
const parseInput = (z, raw) => {
  if (raw === undefined || raw === null || raw === '') return {};
  if (typeof raw === 'object') return raw;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new z.errors.Error(`Input is not valid JSON: ${error.message}`, 'invalid_input_json', 400);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new z.errors.Error('Input must be a JSON object, for example {"domain": "example.com"}', 'invalid_input_json', 400);
  }
  return parsed;
};

/** Drops keys whose value is empty so looot only reads the fields the user filled. */
const removeEmpty = (object) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== ''));

/** Reads a Zapier boolean field, which can arrive as true, "true", "yes" or 1. Empty means on. */
const isOn = (value, fallbackValue = true) => {
  if (value === undefined || value === null || value === '') return fallbackValue;
  if (typeof value === 'boolean') return value;
  return ['true', 'yes', '1', 'on'].includes(String(value).trim().toLowerCase());
};

const clampWait = (value) => {
  const seconds = value === undefined || value === null || value === '' ? DEFAULT_WAIT_SECONDS : Number(value);
  if (Number.isNaN(seconds)) return DEFAULT_WAIT_SECONDS;
  return Math.max(0, Math.min(MAX_WAIT_SECONDS, seconds));
};

/** Shapes a run for Zapier: an id for mapping, plus the normalized fields at the top level. */
const formatRun = (run) => ({
  id: run.runId,
  ...run,
  fields: (run.normalized && run.normalized.fields) || {},
});

/**
 * Sends POST /v1/runs. A run that ends failed, blocked or stopped raises an error with looot's
 * own code and message; a run still queued or running after the wait is returned as is.
 */
const runOperation = async (z, bundle, { endpointId, input, idempotencyKey, wait, fallback, maxCostUsd }) => {
  const body = {
    endpointId,
    input,
    idempotencyKey: (idempotencyKey && String(idempotencyKey).trim()) || buildIdempotencyKey(bundle, endpointId, input),
    wait: clampWait(wait),
  };
  if (isOn(fallback)) {
    const cap = Number(maxCostUsd);
    body.fallback = cap > 0 ? { enabled: true, maxCostUsd: cap } : true;
  }
  const response = await z.request({ method: 'POST', url: `${BASE_URL}/v1/runs`, body });
  const run = response.data;
  if (['failed', 'blocked', 'stopped'].includes(run.status)) {
    const error = run.error || {};
    throw new z.errors.Error(
      `looot run ${run.runId} ended ${run.status}: ${error.message || 'no message'}${run.status === 'failed' ? '. A failed call costs nothing.' : ''}`,
      error.code || `run_${run.status}`,
      400,
    );
  }
  return formatRun(run);
};

module.exports = {
  BASE_URL,
  TERMINAL_STATUSES,
  MAX_WAIT_SECONDS,
  DEFAULT_WAIT_SECONDS,
  addAuthHeader,
  handleErrors,
  toStableJson,
  buildIdempotencyKey,
  parseInput,
  removeEmpty,
  clampWait,
  isOn,
  formatRun,
  runOperation,
};
