import { APIGatewayProxyResult } from 'aws-lambda';
import { createLogger } from '@fiquu/logger';
import nonce from '@fiquu/nonce';

import { createViewLoader, createViewLocals, ViewsConfig, ViewLocals, ViewLoader, ViewLocalArg } from './views';
import * as responses from './responses';

const log = createLogger('HTTP Response');

export interface HTTPResponseConfig {
  /**
   * Error handlers.
   */
  handlers?: Map<number | string, responses.HTTPResponseFunction>;

  /**
   * Views configuration.
   */
  views?: ViewsConfig;

  /**
   * Whether to use nonce.
   */
  nonce?: boolean | number;
}

export interface HTTPResponse {
  /**
   * Handles response error.
   *
   * @param {Error} error The error to handle.
   *
   * @returns {object} The handled HTTP response object.
   */
  handle(error?: Error): APIGatewayProxyResult;

  /**
   * Sends a response to the request.
   *
   * @param {Error|object} response The response object to send.
   *
   * @returns {Error} The appropriate response object.
   */
  send(response: APIGatewayProxyResult): APIGatewayProxyResult;

  /**
   * Renders a view and sends it to the client.
   *
   * @param {string} view The view name to render.
   * @param {object} values The values object to merge into the view locals.
   *
   * @returns {object} The HTTP response object.
   */
  render(view: string, values?: ViewLocalArg): APIGatewayProxyResult;
}

/**
 * Creates the HTTP response params object.
 *
 * @returns {object} The HTTP response params object.
 */
function createHTMLResponseParams(): responses.HTTPResponseParams {
  return {
    body: null,
    headers: {
      'Content-Type': 'text/html'
    },
    options: {
      json: false
    }
  };
}

/**
 * Generates a nonce value from the provided config.
 *
 * @param {boolean|number} size The target size to generate of.
 *
 * @returns {string} The nonce value.
 */
function getNonce(size: number | boolean): string {
  const _size = typeof size === 'number' ? Math.trunc(size) : null;

  return nonce(_size);
}

/**
 * Handles response error.
 *
 * @param {object} config The HTTP response configuration object.
 * @param {Error} error The error to handle.
 *
 * @returns {object} The handled HTTP response object.
 */
function handle(config: HTTPResponseConfig, error?: Error): APIGatewayProxyResult {
  let response = responses.internalServerError();

  if (error && config.handlers) {
    // Handle known Error names.
    if (error['name'] && config.handlers.has(error['name'])) {
      const handledError = config.handlers.get(error['name']);

      response = handledError();
    }

    // Handle known Error messages.
    if (error['message'] && config.handlers.has(error['message'])) {
      const handledError = config.handlers.get(error['message']);

      response = handledError();
    }

    // Handle known Error codes.
    if (error['code'] && config.handlers.has(error['code'])) {
      const handledError = config.handlers.get(error['code']);

      response = handledError();
    }
  }

  log.error('Handled error response', { error, response });

  return response;
}

/**
 * Sends a response to the request.
 *
 * @param {object} config The HTTP response configuration object.
 * @param {Error|object} response The response object to send.
 *
 * @returns {Error} The appropriate response object.
 */
function send(config: HTTPResponseConfig, response: APIGatewayProxyResult): APIGatewayProxyResult {
  // Process empty responses as Internal Server Error (500).
  if (!response) {
    return responses.internalServerError();
  }

  // Send response if it's an instance of Response.
  if (response['statusCode'] && response['body']) {
    return { ...response };
  }

  log.error('Handling unknown error response', { response });

  return handle(config, new Error('Unknown response.'));
}

/**
 * Renders a view and sends it to the client.
 *
 * @param {object} config The HTTP response configuration object.
 * @param {string} view The view name to render.
 * @param {object} values The values object to merge into the view locals.
 *
 * @returns {object} The HTTP response object.
 */
function render(config: HTTPResponseConfig, view: string, values?: ViewLocalArg): APIGatewayProxyResult {
  try {
    const params: responses.HTTPResponseParams = createHTMLResponseParams();
    const locals: ViewLocals = createViewLocals(config.views && config.views.locals, values);
    const views: ViewLoader = createViewLoader(config.views);

    if (config.nonce) {
      locals.nonce = getNonce(config.nonce);
    }

    params.body = views.render(view, locals);

    return responses.ok(params);
  } catch (err) {
    log.error(err.message);

    return handle(err);
  }
}

/**
 * Creates a new HTTP response handler.
 *
 * @param {object} config The HTTP response config.
 *
 * @returns {object} The HTTP response handler instance.
 */
export function createHTTPResponse(config?: HTTPResponseConfig): HTTPResponse {
  const _config = { ...(config || {}) };

  return Object.freeze<HTTPResponse>({
    render: render.bind(null, _config),
    handle: handle.bind(null, _config),
    send: send.bind(null, _config)
  });
}
