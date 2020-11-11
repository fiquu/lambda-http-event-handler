import type { APIGatewayProxyResult } from 'aws-lambda';

import * as base from './base';

export default base;

export type HTTPResponseParams = base.HTTPResponseParams;

/**
 * HTTP response function signature.
 */
export interface HTTPResponseFunction {
  (params?: base.HTTPResponseParams): APIGatewayProxyResult;
}

/**
 * Creates a response with an arbitrary status code.
 *
 * @param {number} statusCode The HTTP status code.
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export function create(statusCode = 200, params: base.HTTPResponseParams = {}): APIGatewayProxyResult {
  return base.create({ ...params, statusCode });
}

// Success

/**
 * Ok HTTP response (200).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const ok: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(200, params);
};

/**
 * Created HTTP response (201).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const created: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(201, params);
};

/**
 * No Content HTTP response (204).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const noContent: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(204, params);
};

// Redirection

/**
 * Moved Permanently HTTP response (301).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const movedPermanently: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(301, params);
};

/**
 * Not Modified HTTP response (302).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const notModified: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(304, params);
};

// Client Error

/**
 * Bad Request HTTP response (400).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const badRequest: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(400, params);
};

/**
 * Unauthorized HTTP response (401).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const unauthorized: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(401, params);
};

/**
 * Forbidden HTTP response (403).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const forbidden: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(403, params);
};

/**
 * Not Found HTTP response (404).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const notFound: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(404, params);
};

/**
 * Not Acceptable HTTP response (406).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const notAcceptable: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(406, params);
};

/**
 * Conflict HTTP response (409).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const conflict: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(409, params);
};

/**
 * Precondition Failed HTTP response (412).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const preconditionFailed: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(412, params);
};

// Server Error

/**
 * Internal Server Error HTTP response (500).
 *
 * @param {object} params The HTTP response params.
 *
 * @returns {object} The HTTP response object.
 */
export const internalServerError: HTTPResponseFunction = (params?: base.HTTPResponseParams): APIGatewayProxyResult => {
  return create(500, params);
};
