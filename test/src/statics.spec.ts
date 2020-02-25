import { join, resolve } from 'path';
import { expect } from 'chai';
import etag from 'etag';
import is from 'fi-is';
import fs from 'fs';

import { createStaticFileHandler, StaticFileHandlerConfig } from '../../src/statics';
import { APIGatewayProxyEvent } from 'aws-lambda';

/**
 * Creates an instance of RequestEvent.
 *
 * @param {string} filename The filename to assing as path parameter.
 *
 * @class
 */
function createProxyEvent(filename): APIGatewayProxyEvent {
  return {
    pathParameters: {
      filename
    },
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    isBase64Encoded: false,
    multiValueHeaders: {},
    requestContext: null,
    stageVariables: {},
    httpMethod: 'GET',
    // IsOffline: true,
    resource: '/',
    headers: {},
    path: '/',
    body: '',
  };
}

describe('Statics', function () {
  this.timeout(30000);

  let config: StaticFileHandlerConfig = null;

  before(function () {
    config = {
      basedir: join(__dirname, '..', 'fixtures', 'statics')
    };
  });

  it('should be a function', function () {
    expect(createStaticFileHandler).to.be.a('function');
  });

  it('should not create a new instance with an invalid config basedir', function () {
    expect(() => createStaticFileHandler({ basedir: null })).to.throw();
  });

  it('should create a new instance with a valid config', function () {
    let statics;

    expect(() => statics = createStaticFileHandler(config)).to.not.throw();
    expect(statics).to.have.keys('get');
  });

  describe('get', function () {
    it('should handle a file not found', async function () {
      const statics = createStaticFileHandler(config);

      const event = createProxyEvent('not-a-file');
      const response = await statics.get(event);

      expect(response).to.not.be.empty;
      expect(response).to.have.keys('statusCode', 'headers', 'body', 'isBase64Encoded');
      expect(response.statusCode).to.equal(404);
      expect(response.headers).to.have.key('Content-Type');
      expect(response.headers['Content-Type']).to.equal('text/plain');
      expect(response.body).to.be.empty;
    });

    it('should send an image as base64', async function () {
      const statics = createStaticFileHandler(config);

      const event = createProxyEvent('image.jpg');
      const response = await statics.get(event);

      expect(response).to.not.be.empty;
      expect(response).to.have.keys('statusCode', 'headers', 'body', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Content-Length', 'Cache-Control', 'ETag');
      expect(response.headers['Content-Type']).to.equal('image/jpeg');
      expect(is.base64(response.body)).to.be.true;
      expect(response.body).to.be.a('string')
        .of.length(Number(response.headers['Content-Length']));
    });

    it('should send an image as base64 without ETag', async function () {
      const statics = createStaticFileHandler({
        ...config,
        etag: false
      });

      const event = createProxyEvent('image.jpg');
      const response = await statics.get(event);

      expect(response).to.not.be.empty;
      expect(response).to.have.keys('statusCode', 'headers', 'body', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Content-Length', 'Cache-Control');
      expect(response.headers).to.not.have.key('ETag');
      expect(response.headers['Content-Type']).to.equal('image/jpeg');
      expect(response.headers['ETag']).to.be.undefined;
      expect(is.base64(response.body)).to.be.true;
      expect(response.body).to.be.a('string')
        .of.length(Number(response.headers['Content-Length']));
    });

    it('should send an image as base64 with ETag', async function () {
      const statics = createStaticFileHandler({
        ...config,
        etag: true
      });

      const event = createProxyEvent('image.jpg');
      const response = await statics.get(event);

      const filePath = resolve(join('test', 'fixtures', 'statics', 'image.jpg'));
      const fileData = fs.readFileSync(filePath);

      expect(response).to.not.be.empty;
      expect(response).to.have.keys('statusCode', 'headers', 'body', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Content-Length', 'Cache-Control', 'ETag');
      expect(response.headers['Content-Type']).to.equal('image/jpeg');
      expect(response.headers['ETag']).to.be.a('string').that.equals(
        etag(fileData.toString('base64'))
      );

      expect(is.base64(response.body)).to.be.true;
      expect(response.body).to.be.a('string')
        .of.length(Number(response.headers['Content-Length']));
    });

    it('should send a PDF document as base64', async function () {
      const statics = createStaticFileHandler(config);

      const event = createProxyEvent('document.pdf');
      const response = await statics.get(event);

      expect(response).to.not.be.empty;
      expect(response).to.have.keys('statusCode', 'headers', 'body', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Content-Length', 'Cache-Control', 'ETag');
      expect(response.headers['Content-Type']).to.equal('application/pdf');
      expect(is.base64(response.body)).to.be.true;
      expect(response.body).to.be.a('string')
        .of.length(Number(response.headers['Content-Length']));
    });

    it('should send a spreadsheet as base64', async function () {
      const statics = createStaticFileHandler(config);

      const event = createProxyEvent('spreadsheet.xls');
      const response = await statics.get(event);

      expect(response).to.not.be.empty;
      expect(response).to.have.keys('statusCode', 'headers', 'body', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Content-Length', 'Cache-Control', 'ETag');
      expect(response.headers['Content-Type']).to.equal('application/vnd.ms-excel');
      expect(is.base64(response.body)).to.be.true;
      expect(response.body).to.be.a('string')
        .of.length(Number(response.headers['Content-Length']));
    });

    it('should send an XML file as base64', async function () {
      const statics = createStaticFileHandler(config);

      const event = createProxyEvent('data.xml');
      const response = await statics.get(event);

      expect(response).to.not.be.empty;
      expect(response).to.have.keys('isBase64Encoded', 'statusCode', 'headers', 'body');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Content-Length', 'Cache-Control', 'ETag');
      expect(response.headers['Content-Type']).to.equal('application/xml');
      expect(is.base64(response.body)).to.be.true;
      expect(response.body).to.be.a('string')
        .of.length(Number(response.headers['Content-Length']));
    });

    it('should send a text document as plain text', async function () {
      const statics = createStaticFileHandler(config);

      const event = createProxyEvent('text.txt');
      const response = await statics.get(event);

      expect(response).to.not.be.empty;
      expect(response).to.have.keys('isBase64Encoded', 'statusCode', 'headers', 'body');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Content-Length', 'Cache-Control', 'ETag');
      expect(response.headers['Content-Type']).to.equal('text/plain');
      expect(is.base64(response.body)).to.be.false;
      expect(response.body).to.be.a('string')
        .of.length(Number(response.headers['Content-Length']));
    });

    it('should send a JSON file as plain text', async function () {
      const statics = createStaticFileHandler(config);

      const event = createProxyEvent('data.json');
      const response = await statics.get(event);

      expect(response).to.not.be.empty;
      expect(response).to.have.keys('isBase64Encoded', 'statusCode', 'headers', 'body');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Content-Length', 'Cache-Control', 'ETag');
      expect(response.headers['Content-Type']).to.equal('application/json');
      expect(is.base64(response.body)).to.be.false;
      expect(response.body).to.be.a('string')
        .of.length(Number(response.headers['Content-Length']));
    });
  });
});
