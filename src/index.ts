import type { APIGatewayProxyEvent } from 'aws-lambda';

import { createHTTPResponse, HTTPResponse, HTTPResponseConfig } from './response';
import { createHTTPRequest, HTTPRequest } from './request';

export interface HTTPEventConfig {
  res: HTTPResponseConfig;
}

export interface HTTPEvent {
  res: HTTPResponse;
  req: HTTPRequest;
}

/**
 * Creates a new instance of the HTTP Event class.
 *
 * @param {object} event The API Gateway HTTP proxy event.
 * @param {object} config The HTTP event configuration object.
 *
 * @returns {object} The HTTP Event object.
 */
export function createHTTPEvent(event: APIGatewayProxyEvent, config: HTTPEventConfig): HTTPEvent {
  return Object.freeze<HTTPEvent>({
    res: createHTTPResponse(config.res),
    req: createHTTPRequest(event)
  });
}
