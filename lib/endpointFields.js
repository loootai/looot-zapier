'use strict';

const { BASE_URL, removeEmpty } = require('./client');

/** Names the Run Endpoint action uses itself. An endpoint field with one of these names gets an input_ prefix. */
const RESERVED_KEYS = ['search_words', 'endpoint_id', 'input', 'fallback', 'max_cost_usd', 'wait', 'idempotency_key'];

const toFieldKey = (name) => (RESERVED_KEYS.includes(name) ? `input_${name}` : name);

const toPlainText = (text) => String(text ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

/** The first sentence of a text, cut to max characters. */
const firstSentence = (text, max = 220) => {
  const first = toPlainText(text).split(/(?<=[.!?])\s/)[0] || '';
  return first.length > max ? `${first.slice(0, max - 3)}...` : first;
};

/** "first_name" or "firstName" becomes "First name". */
const toSentenceCase = (key) => {
  const words = String(key).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_\-.]+/g, ' ').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** The price text of a catalog row, for example "$0.0089 per call". */
const toPriceText = (price) => {
  if (!price) return 'price on request';
  if (price.estimateFormula) return price.estimateFormula;
  return price.perCall !== undefined ? `$${price.perCall} per call` : 'price on request';
};

/** The main type of a JSON schema property. */
const typeOf = (spec) => {
  const type = Array.isArray(spec.type) ? spec.type.find((t) => t !== 'null') : spec.type;
  return type || (spec.anyOf || spec.oneOf ? 'object' : undefined);
};

/** Zapier field definitions from the inputSchema of GET /v1/operations/{id}. Required fields come first. */
const fieldsFromSchema = (schema) => {
  const properties = (schema && schema.properties) || {};
  const required = new Set((schema && schema.required) || []);
  const fields = Object.entries(properties).map(([name, raw]) => {
    const spec = raw && typeof raw === 'object' ? raw : {};
    const type = typeOf(spec);
    const help = firstSentence(spec.description, 300);
    const field = { key: toFieldKey(name), label: toSentenceCase(name), required: required.has(name) };
    if (help) field.helpText = help;
    if (Array.isArray(spec.enum) && spec.enum.length) {
      field.type = 'string';
      field.choices = spec.enum.map((value) => ({ value: String(value), sample: String(value), label: String(value) }));
    } else if (type === 'integer') field.type = 'integer';
    else if (type === 'number') field.type = 'number';
    else if (type === 'boolean') field.type = 'boolean';
    else if (type === 'array') {
      field.type = 'string';
      field.list = true;
    } else if (type === 'object') {
      field.type = 'text';
      field.helpText = `${help ? `${help} ` : ''}Type a JSON object.`.trim();
    } else field.type = 'string';
    return field;
  });
  return fields.sort((a, b) => Number(b.required) - Number(a.required));
};

/** Builds the run input from the dynamic fields and the Input (JSON) object. The JSON object wins on a clash. */
const buildInput = (inputData, schema, jsonInput) => {
  const properties = (schema && schema.properties) || {};
  const input = {};
  for (const [name, raw] of Object.entries(properties)) {
    const value = inputData[toFieldKey(name)];
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) continue;
    const spec = raw && typeof raw === 'object' ? raw : {};
    if (typeOf(spec) === 'object' && typeof value === 'string') {
      try {
        input[name] = JSON.parse(value);
        continue;
      } catch {
        // keep the typed text, the API will name the field if it is wrong
      }
    }
    input[name] = value;
  }
  return { ...input, ...removeEmpty(jsonInput || {}) };
};

/** Dropdown of runnable endpoints. "Search words" narrows the list. Pages with paging_token. */
const endpointChoices = async (z, bundle) => {
  const words = String(bundle.inputData.search_words || '').trim();
  const token = bundle.meta && bundle.meta.paging_token;
  let rows;
  let next = null;
  if (words) {
    const offset = Number(token) || 0;
    const response = await z.request({ url: `${BASE_URL}/v1/catalog/search`, params: { q: words, limit: 25, offset } });
    rows = response.data.endpoints || [];
    if (typeof response.data.nextOffset === 'number' && rows.length) next = String(response.data.nextOffset);
  } else {
    const params = { limit: 50 };
    if (token) params.cursor = token;
    const response = await z.request({ url: `${BASE_URL}/v1/catalog/endpoints`, params });
    rows = response.data.endpoints || [];
    next = response.data.nextCursor || null;
  }
  const results = rows
    .filter((row) => row.runnableNow !== false)
    .map((row) => ({ id: row.endpointId, label: `${row.name || row.endpointId} | ${toPriceText(row.price)}` }));
  return { results, paging_token: next };
};

/** Reads GET /v1/operations/{id}. Returns null on a 404 so the caller can say what to do. */
const readOperation = async (z, endpointId) => {
  const response = await z.request({
    url: `${BASE_URL}/v1/operations/${encodeURIComponent(endpointId)}`,
    skipThrowForStatus: true,
  });
  return response.status === 404 ? null : response.data;
};

const unknownEndpoint = (z, endpointId) =>
  new z.errors.Error(`looot has no endpoint "${endpointId}". Use Find Operations in Catalog to look one up.`, 'endpoint_not_found', 404);

/** One input field per property of the chosen endpoint. A job: id has no schema, so it adds none. */
const endpointInputFields = async (z, bundle) => {
  const endpointId = String(bundle.inputData.endpoint_id || '').trim();
  if (!endpointId || endpointId.startsWith('job:')) return [];
  const operation = await readOperation(z, endpointId);
  if (!operation) throw unknownEndpoint(z, endpointId);
  return fieldsFromSchema(operation.inputSchema);
};

module.exports = {
  RESERVED_KEYS,
  toFieldKey,
  firstSentence,
  toSentenceCase,
  toPriceText,
  fieldsFromSchema,
  buildInput,
  endpointChoices,
  readOperation,
  unknownEndpoint,
  endpointInputFields,
};
