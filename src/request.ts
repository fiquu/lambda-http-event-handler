import { APIGatewayProxyEvent } from 'aws-lambda';

export interface HTTPRequest {
  /**
   * The request body.
   */
  body: object | string | number | boolean | null;

  /**
   * The request headers.
   */
  headers: Map<string, string>;

  /**
   * The request path parameters.
   */
  params: Map<string, string>;

  /**
   * The request query string parameters.
   */
  query: Map<string, string>;
}

/**
 * Gets the HTTP request headers.
 *
 * @param {object} event The HTTP request event.
 *
 * @returns {object} The HTTP request headers object.
 */
function getHeaders(event: APIGatewayProxyEvent): Map<string, string> {
  const headers: Map<string, string> = new Map();

  for (const name of Object.keys(event.headers)) {
    const value = event && event.headers && event.headers[String(name)];

    headers.set(name.toLowerCase(), value);
  }

  return headers;
}

/**
 * Gets the HTTP request path parameters.
 *
 * @param {object} event The HTTP request event.
 *
 * @returns {object} The HTTP request path parameters object.
 */
function getParams(event: APIGatewayProxyEvent): Map<string, string> {
  return new Map(Object.entries(
    event && event.pathParameters || {}
  ));
}

/**
 * Gets the HTTP request query string parameters.
 *
 * @param {object} event The HTTP request event.
 *
 * @returns {object} The HTTP request query string parameters object.
 */
function getQuery(event: APIGatewayProxyEvent): Map<string, string> {
  return new Map(Object.entries(
    event && event.queryStringParameters || {}
  ));
}

/**
 * Gets the HTTP request body as parsed JSON if possible.
 *
 * @param {object} event The HTTP request event.
 *
 * @returns {object|string|number|boolean|null} The HTTP request body.
 */
function getBody(event: APIGatewayProxyEvent): object | string | number | boolean | null {
  try {
    return JSON.parse(event.body);
  } catch (err) { }

  return event.body;
}

/**
 * Creates an HTTP request object.
 *
 * @param {object} event The API Gateway HTTP event object.
 *
 * @returns {object} The HTTP request object.
 */
export function createHTTPRequest(event: APIGatewayProxyEvent): HTTPRequest {
  if (!(event instanceof Object)) {
    throw new Error('Event must be an object');
  }

  return Object.freeze<HTTPRequest>({
    /**
     * @returns {object|string} The request body, parsed as JSON if possible.
     */
    get body(): object | string | number | boolean | null {
      return getBody(event);
    },

    /**
     * @returns {object} The request headers.
     */
    get headers(): Map<string, string> {
      return getHeaders(event);
    },

    /**
     * @returns {object} The request path parameters.
     */
    get params(): Map<string, string> {
      return getParams(event);
    },

    /**
     * @returns {object} The request query string parameters.
     */
    get query(): Map<string, string> {
      return getQuery(event);
    }
  });
}
