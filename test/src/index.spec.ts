import { expect } from 'chai';
import { join } from 'path';

import { createHTTPEvent, HTTPEventConfig, HTTPEvent } from '../../src';

import { APIGatewayProxyEvent } from 'aws-lambda';

describe('Event', function () {
  this.timeout(30000);

  let event: APIGatewayProxyEvent = null;
  let config: HTTPEventConfig = null;

  before(function () {
    event = {
      body: '{"foo":"bar"}',
      httpMethod: 'get',
      headers: {},
      path: '/',
      multiValueQueryStringParameters: null,
      queryStringParameters: null,
      multiValueHeaders: null,
      isBase64Encoded: false,
      pathParameters: null,
      requestContext: null,
      stageVariables: null,
      resource: null
    };

    config = {
      res: {
        nonce: true,
        views: {
          basedir: join(__dirname, '..', 'fixtures', 'views'),
          locals: {}
        }
      }
    };
  });

  it('should be a function', function () {
    expect(createHTTPEvent).to.be.a('function');
  });

  it('should not configure with an empty event and config', function () {
    expect(() => createHTTPEvent(undefined, undefined)).to.throw();
    expect(() => createHTTPEvent(null, null)).to.throw();
  });

  it('should create a new instance with a valid event config', function () {
    expect(() => createHTTPEvent(event, config)).to.not.throw();
  });

  it('should create both a [req] and a [res] objects with a valid event', function () {
    const { req, res }: HTTPEvent = createHTTPEvent(event, config);

    expect(req).to.be.an('object');
    expect(req.body).to.be.an('object');
    expect(req.params).to.be.a('map');
    expect(req.headers).to.be.a('map');
    expect(req.query).to.be.a('map');

    expect(res).to.be.an('object');
    expect(res.send).to.be.a('function');
    expect(res.render).to.be.a('function');
    expect(res.handle).to.be.a('function');
  });
});
