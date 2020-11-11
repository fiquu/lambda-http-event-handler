import type { APIGatewayProxyResult } from 'aws-lambda';

import { createLogger } from '@fiquu/logger';

const log = createLogger('HTTP Responses');

export interface HTTPResponseOptions {
  /**
   * Whether content should be treated as Base64 encoded. Overrides `json`.
   */
  isBase64Encoded?: boolean;

  /**
   * Whether the content should be encoded as JSON.
   */
  json?: boolean;
}

export interface HTTPResponseHeaders {
  [header: string]: boolean | number | string;
}

export interface HTTPResponseParams {
  /**
   * The HTTP response headers to send.
   */
  headers?: HTTPResponseHeaders;

  /**
   * The HTTP response options.
   */
  options?: HTTPResponseOptions;

  /**
   * The HTTP response body.
   */
  body?: string | unknown;

  /**
   * The HTTP response code.
   */
  statusCode?: number;
}

/**
 * Default API Gateway response values.
 */
const _defaultResponse: APIGatewayProxyResult = Object.freeze<APIGatewayProxyResult>({
  statusCode: 200,
  body: '""',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Default HTTP response params.
 */
export const defaults: HTTPResponseParams = Object.freeze<HTTPResponseParams>({
  body: '',
  statusCode: Number(_defaultResponse.statusCode),
  headers: Object.freeze({
    'Content-Type': 'application/json'
  }),
  options: Object.freeze({
    json: true
  })
});

/**
 * Normalizes and merges the paramters and defaults
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response params.
 */
function normalizeParams(params: HTTPResponseParams): HTTPResponseParams {
  return {
    ...defaults,
    ...params,
    headers: {
      ...defaults.headers,
      ...params.headers
    },
    options: {
      ...defaults.options,
      ...params.options
    }
  };
}

/**
 * Creates an Internal Server Error (500) response.
 *
 * @returns {object} The HTTP response object.
 */
function internalServerError(): APIGatewayProxyResult {
  return {
    ..._defaultResponse,
    statusCode: 500
  };
}

/**
 * Creates an HTTP response.
 *
 * @param {object} params The parameter to create the response with.
 * @param {number} params.statusCode The HTTP status code.
 * @param {string} params.body The body content.
 * @param {object} params.headers The headers object.
 * @param {boolean} params.isBase64Encoded Whether the response is Base64 encoded.
 *
 * @returns {object} The HTTP response.
 */
function createResponse({ statusCode, body, headers, isBase64Encoded }): APIGatewayProxyResult {
  const res: APIGatewayProxyResult = {
    body,
    isBase64Encoded: Boolean(isBase64Encoded),
    statusCode: Math.trunc(statusCode),
    headers: {
      ...(headers || {})
    }
  };

  return res;
}

/**
 * Creates a response as JSON.
 *
 * @param {object} res The HTTP response object.
 *
 * @returns {object} The JSON HTTP response object.
 */
function asJSON(res: APIGatewayProxyResult): APIGatewayProxyResult {
  const _res = { ...res };

  try {
    _res.body = JSON.stringify(res.body);
    _res.headers['Content-Type'] = 'application/json';
  } catch (err) {
    log.error(`Response body could not be stringified: ${err.message}`);

    return internalServerError();
  }

  return _res;
}

/**
 * Creates an instance of Response.
 *
 * @param {object} params The response parameters.
 * @param {number} params.statusCode The HTTP code.
 * @param {string|object} params.body The response body.
 * @param {object} params.headers Headers to send.
 * @param {object} params.options The HTTP response options object.
 *
 * @returns {object} The HTTP response object.
 */
export function create(params: HTTPResponseParams): APIGatewayProxyResult {
  const { statusCode, headers, body, options }: HTTPResponseParams = normalizeParams(params);

  if (statusCode < 100 || statusCode > 599) {
    log.error(`Response status code out of bounds: ${statusCode}`);

    return internalServerError();
  }

  const { isBase64Encoded } = options;
  const res = createResponse({ statusCode, headers, body, isBase64Encoded });

  if (!res.isBase64Encoded && options.json) {
    return asJSON(res);
  }

  return res;
}
