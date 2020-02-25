/**
 * HTTP Statics Component module.
 *
 * @module https/statics
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Statics from 'serverless-aws-static-file-handler';
import etag from 'etag';

import { HTTPResponseParams } from './responses/base';
import { ok, notFound } from './responses';

/**
 * Statics config interface.
 */
export interface StaticFileHandlerConfig {
  /**
   * Statics basedir to read from.
   */
  basedir: string;

  /**
   * Default HTTP headers to send.
   */
  headers?: Record<string, string>;

  /**
   * Whether to include ETag header.
   */
  etag?: boolean;
}

export interface StaticFileHandler {
  /**
   * Resolves a static file from the provided event.
   *
   * @param {object} The API Gateway HTTP event.
   *
   * @returns {object} The HTTP response.
   */
  get(event: APIGatewayProxyEvent);
}

export interface FileData {
  /**
   * File HTTP headers.
   */
  headers: Record<string, string>;

  /**
   * Whether the file is Base64 encoded.
   */
  isBase64Encoded: boolean;

  /**
   * File string data.
   */
  body: string;
}

export interface ResponseParams {
  /**
   * Whether to include the ETag header on the response.
   */
  withEtag: boolean;

  /**
   * Default HTTP headers to merge into the response.
   */
  defaultHeaders: Record<string, string>;
}

export type GetFileResult = Promise<APIGatewayProxyResult>;

/**
 * Creates a file not found response.
 *
 * @returns {object} The HTTP response.
 */
function fileNotFound(): APIGatewayProxyResult {
  return notFound({
    headers: {
      'Content-Type': 'text/plain'
    },
    options: {
      json: false
    }
  });
}

/**
 * Creates an HTTP response params object.
 *
 * @param {object} resParams The response parameters object.
 * @param {object} fileData The file data object.
 *
 * @returns {object} The HTTP response params object.
 */
function getResponseParams(resParams: ResponseParams, fileData: FileData): HTTPResponseParams {
  const { body, headers, isBase64Encoded } = fileData;
  const { withEtag, defaultHeaders } = resParams;

  const params: HTTPResponseParams = {
    body: String(body),
    headers: {
      ...defaultHeaders,
      'Content-Length': String(Buffer.byteLength(body)),
      'Content-Type': headers['Content-Type']
    },
    options: {
      isBase64Encoded,
      json: false
    }
  };

  if (withEtag) {
    params.headers.ETag = etag(body);
  }

  return params;
}

/**
 * Retrieves a file and builds the response.
 *
 * @param {Statics} handler The static file handler instance.
 * @param {object} resParams The response parameters object.
 * @param {object} event The HTTP event object.
 *
 * @returns {Promise} A promise to the HTTP response object.
 */
async function get(handler: Statics, resParams: ResponseParams, event: APIGatewayProxyEvent): GetFileResult {
  const { body, statusCode, isBase64Encoded, headers } = await handler.get(event);
  const { withEtag, defaultHeaders } = resParams;

  if (statusCode === 404) {
    return fileNotFound();
  }

  const params: HTTPResponseParams = getResponseParams(
    { withEtag, defaultHeaders },
    { body, isBase64Encoded, headers }
  );

  return ok(params);
}

/**
 * Configures the module.
 *
 * @param {object} config The configuration object.
 * @param {string} config.basedir The statics basedir.
 * @param {object} config.headers The default headers to set.
 * @param {boolean} config.etag whether to set the ETag header (defaults to `true`).
 *
 * @returns {object} The statics file handler instance.
 */
export function createStaticFileHandler(config: StaticFileHandlerConfig): StaticFileHandler {
  const withEtag = typeof config.etag === 'boolean' ? config.etag : true;
  const handler: Statics = new Statics(config.basedir);
  const defaultHeaders: Record<string, string> = {
    'Cache-Control': 'public, max-age=31536000',
    ...(config.headers || {})
  };

  return Object.freeze<StaticFileHandler>({
    get: get.bind(null, handler, { withEtag, defaultHeaders })
  });
}

