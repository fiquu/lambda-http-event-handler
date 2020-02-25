import { APIGatewayProxyEvent } from 'aws-lambda';
import { expect } from 'chai';
import faker from 'faker';

import { createHTTPRequest } from '../../src/request';

describe('Request', function () {
  this.timeout(30000);

  let event: APIGatewayProxyEvent = null;

  before(function () {
    event = {
      multiValueQueryStringParameters: null,
      multiValueHeaders: null,
      isBase64Encoded: false,
      body: '{"foo":"bar"}',
      stageVariables: null,
      requestContext: null,
      httpMethod: 'get',
      resource: null,
      path: '/',
      headers: {
        'Accept-Language': 'en-US',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiO' +
          'iIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
          'vGMoWQX2fpzfNY-pKx6Hudsb3oilj_ZGRjkNAe4Zdkc',
        Host: 'localhost',
        Referer: 'http://localhost:8080',
        'User-Agent': 'mocha/6.2.2 [test]',
        Accept: 'text/plain'
      },
      queryStringParameters: {
        page: '1',
        order: 'asc'
      },
      pathParameters: {
        id: faker.random.uuid(),
        group: 'enabled'
      }
    };
  });

  it('should be a function', function () {
    expect(createHTTPRequest).to.be.an('function');
  });

  it('should not create a new instance with an empty event', function () {
    expect(() => createHTTPRequest(null)).to.throw();
  });

  it('should create a new instance with a valid event', function () {
    const req = createHTTPRequest(event);

    expect(req).to.have.all.keys('body', 'query', 'params', 'headers');
  });

  it('should create a new instance with a non JSON event body', function () {
    const body = 'This is not a JSON';
    const req = createHTTPRequest({ ...event, body });

    expect(req).to.have.all.keys('body', 'query', 'params', 'headers');
    expect(req.body).to.be.a('string').that.equals(body);
  });

  it('should create a new instance with event headers', function () {
    const req = createHTTPRequest({
      ...event,
      headers: {
        'X-Foo': 'Bar'
      }
    });

    expect(req).to.have.all.keys('body', 'query', 'params', 'headers');
    expect(req.body).to.be.an('object');
    expect(req.query).to.be.a('map');
    expect(req.headers).to.be.a('map').that.has.key('x-foo');
    expect(req.params).to.be.a('map');
  });
});
