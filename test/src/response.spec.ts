import { expect } from 'chai';
import { join } from 'path';
import faker from 'faker';
import is from 'fi-is';

import { createHTTPResponse, HTTPResponseConfig } from '../../src/response';
import * as responses from '../../src/responses';

import namedResponses from '../fixtures/named-responses';

describe('Response', function () {
  this.timeout(30000);

  let config: HTTPResponseConfig = null;

  before(function () {
    const handlers = new Map();

    handlers.set(11000, responses.conflict);
    handlers.set('ValidationError', responses.badRequest);
    handlers.set('You must do that first!', responses.preconditionFailed);

    config = {
      handlers,
      headers: {
        'Default-Header': 'default value'
      },
      views: {
        basedir: join(__dirname, '..', 'fixtures', 'views'),
        locals: {}
      }
    };
  });

  it('should be a function', function () {
    expect(createHTTPResponse).to.be.a('function');
  });

  it('should create an instance without a config', function () {
    let res;

    expect(() => res = createHTTPResponse()).to.not.throw();
    expect(res).to.have.keys('render', 'send', 'handle');
  });

  it('should create an instance with valid config', function () {
    let res;

    expect(() => res = createHTTPResponse(config)).to.not.throw();
    expect(res).to.have.keys('render', 'send', 'handle');
  });

  describe('send', function () {
    it('should send an Internal Server Error (500) on empty response', function () {
      const res = createHTTPResponse(config);
      const response = res.send(null);

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(500);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('""');
      expect(response.headers).to.be.an('object').that.includes.keys('Default-Header');
      expect(response.headers['Default-Header']).to.equal(config.headers['Default-Header']);
    });

    it('should send an Internal Server Error (500) on unknown response', function () {
      const res = createHTTPResponse(config);
      const _res = responses.create();

      delete _res['statusCode'];

      const response = res.send(_res);

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(500);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('""');
    });

    it('should send an Internal Server Error (500) on out of bound status code', function () {
      const res = createHTTPResponse(config);

      for (const statusCode of [-200, -40, -1, 0, 1, 2, 3, 4, 10, 23, 99, 600, 750, 93934]) {
        const response = res.send(responses.create(statusCode));

        expect(response).to.be.an('object');
        expect(response).to.have.all.keys('statusCode', 'body', 'headers');
        expect(response.statusCode).to.equal(500);
        expect(is.json(response.body)).to.be.true;
        expect(response.body).to.equal('""');
      }
    });

    it('should send a Base64 encoded response', function () {
      const body = Buffer.from(faker.random.image()).toString('base64');
      const res = createHTTPResponse(config);

      const headers = {
        'Content-Type': 'image/jpeg'
      };

      const options = {
        isBase64Encoded: true
      };

      const response = res.send(responses.ok({ body, headers, options }));

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.be.an('object');
      expect(response.headers).to.have.keys('Content-Type', 'Default-Header');
      expect(response.headers['Content-Type']).to.equal('image/jpeg');
      expect(response.headers['Default-Header']).to.equal(config.headers['Default-Header']);
      expect(is.json(response.body)).to.be.false;
      expect(response.body).to.equal(body);
    });

    it('should create a default response', function () {
      const res = createHTTPResponse(config);
      const response = res.send(responses.create());

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Default-Header');
      expect(response.headers['Content-Type']).to.equal('application/json');
      expect(response.headers['Default-Header']).to.equal(config.headers['Default-Header']);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('""');
    });

    it('should create a custom response', function () {
      const res = createHTTPResponse(config);
      const response = res.send(responses.create(411, {
        body: 'body',
        headers: {
          Test: 'Header'
        }
      }));

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(411);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('"body"');
      expect(response.headers).to.be.an('object');
      expect(response.headers).to.have.keys('Test', 'Content-Type', 'Default-Header');
      expect(response.headers['Default-Header']).to.equal(config.headers['Default-Header']);
      expect(response.headers.Test).to.equal('Header');
      expect(response.headers['Content-Type']).to.equal('application/json');
    });

    it('should create a named response', function () {
      for (const [name, statusCode] of namedResponses) {
        const uuid = faker.random.uuid();
        const body = faker.random.words(6);
        const headers = {
          uuid
        };

        const params: responses.HTTPResponseParams = { body, headers };
        const fn: responses.HTTPResponseFunction = responses[String(name)];
        const response = fn(params);

        expect(response).to.be.an('object');
        expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
        expect(response.statusCode).to.equal(statusCode);
        expect(is.json(response.body)).to.be.true;
        expect(response.body).to.equal(`"${body}"`);
        expect(response.headers).to.be.an('object');
        expect(response.headers).to.have.keys('uuid', 'Content-Type');
        expect(response.headers.uuid).to.equal(uuid);
        expect(response.headers['Content-Type']).to.equal('application/json');
      }
    });

    it('should create a named response as JSON', function () {
      for (const [name, statusCode] of namedResponses) {
        const uuid = faker.random.uuid();

        const headers = {
          uuid
        };

        const body = {
          a: faker.random.word(),
          b: faker.random.word(),
          c: faker.random.word()
        };

        const options = {
          json: true
        };

        const params: responses.HTTPResponseParams = { body, headers, options };
        const fn: responses.HTTPResponseFunction = responses[String(name)];
        const response = fn(params);

        expect(response).to.be.an('object');
        expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
        expect(response.statusCode).to.equal(statusCode);
        expect(is.json(response.body)).to.be.true;
        expect(response.body).to.equal(JSON.stringify(body));
        expect(response.headers).to.be.an('object');
        expect(response.headers).to.have.keys('uuid', 'Content-Type');
        expect(response.headers.uuid).to.equal(uuid);
        expect(response.headers['Content-Type']).to.equal('application/json');
      }
    });

    it('should fail if creating a named response instance as JSON with an invalid JSON body', function () {
      for (const [name] of namedResponses) {
        const uuid = faker.random.uuid();

        const body = {
          foo: 'bar',
          baz: null
        };

        body.baz = body;

        const headers = {
          uuid
        };

        const options = {
          json: true
        };

        const params: responses.HTTPResponseParams = { body, headers, options };
        const fn: responses.HTTPResponseFunction = responses[String(name)];
        const response = fn(params);

        expect(response).to.be.an('object');
        expect(response).to.have.all.keys('statusCode', 'body', 'headers');
        expect(response.statusCode).to.equal(500);
        expect(is.json(response.body)).to.be.true;
        expect(response.body).to.equal('""');
        expect(response.headers).to.have.keys('Content-Type');
        expect(response.headers['Content-Type']).to.equal('application/json');
      }
    });

    it('should create a named response not as JSON', function () {
      for (const [name, statusCode] of namedResponses) {
        const uuid = faker.random.uuid();

        const body = {
          foo: 'bar',
          baz: null
        };

        body.baz = body; // Should throw recursive object error

        const headers = {
          uuid
        };

        const options = {
          json: false
        };

        const params: responses.HTTPResponseParams = { body, headers, options };
        const fn: responses.HTTPResponseFunction = responses[String(name)];
        const response = fn(params);

        expect(response).to.be.an('object');
        expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
        expect(response.statusCode).to.equal(statusCode);
        expect(is.json(response.body)).to.be.false;
        expect(response.body).to.equal(body);
        expect(response.headers).to.be.an('object');
        expect(response.headers).to.have.keys('uuid', 'Content-Type');
        expect(response.headers['Content-Type']).to.equal('application/json');
        expect(response.headers.uuid).to.equal(uuid);
      }
    });
  });

  describe('handle', function () {
    it('should handle errors without known error codes', function () {
      const res = createHTTPResponse({
        ...config,
        handlers: undefined
      });

      const error = new Error();

      error['code'] = 11000;

      const response = res.handle(error);

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(500);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('""');
    });

    it('should handle known response error codes', function () {
      const res = createHTTPResponse(config);
      const error = new Error();

      error['code'] = 11000;

      const response = res.handle(error);

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(409);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('""');
    });

    it('should handle known response error names', function () {
      const res = createHTTPResponse(config);
      const error = new Error();

      error.name = 'ValidationError';

      const response = res.handle(error);

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(400);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('""');
    });

    it('should handle known response error messages', function () {
      const res = createHTTPResponse(config);
      const error = new Error('You must do that first!');

      const response = res.handle(error);

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(412);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('""');
    });

    it('should handle generic errors as Internal Server Error', function () {
      const res = createHTTPResponse(config);
      const response = res.handle(new Error());

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(500);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('""');
    });

    it('should handle unknown responses as Internal Server Error', function () {
      const res = createHTTPResponse(config);
      const response = res.handle(undefined);

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(500);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('""');
    });
  });

  describe('render', function () {
    it('should handle rendering errors', function () {
      const res = createHTTPResponse(config);
      const response = res.render(null);

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(500);
      expect(is.json(response.body)).to.be.true;
      expect(response.body).to.equal('""');
    });

    it('should render a view', function () {
      const res = createHTTPResponse(config);
      const response = res.render('index');

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Default-Header');
      expect(response.headers['Content-Type']).to.equal('text/html');
      expect(response.headers['Default-Header']).to.equal(config.headers['Default-Header']);
      expect(is.json(response.body)).to.be.false;
      expect(response.body).to.contain('<!DOCTYPE html>')
        .and.to.contain('</html>');
    });

    it('should render a view with locals', function () {
      const res = createHTTPResponse(config);
      const uuid = faker.random.uuid();
      const response = res.render('some/sub/folder/locals', {
        uuid
      });

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Default-Header');
      expect(response.headers['Default-Header']).to.equal(config.headers['Default-Header']);
      expect(response.headers['Content-Type']).to.equal('text/html');
      expect(is.json(response.body)).to.be.false;
      expect(response.body).to.contain('<!DOCTYPE html>')
        .and.to.contain(uuid)
        .and.to.contain('</html>');
    });

    it('should render a view with a nonce as boolean', function () {
      const res = createHTTPResponse({
        ...config,
        nonce: true
      });

      const response = res.render('some/sub/folder/locals');

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Default-Header');
      expect(response.headers['Default-Header']).to.equal(config.headers['Default-Header']);
      expect(response.headers['Content-Type']).to.equal('text/html');
      expect(is.json(response.body)).to.be.false;
      expect(response.body).to.contain('<!DOCTYPE html>')
        .and.to.match(/.+\snonce="[A-Za-z0-9_/+=]+".+/)
        .and.to.contain('</html>');
    });

    it('should render a view with a nonce as a number', function () {
      const res = createHTTPResponse({
        ...config,
        nonce: 20
      });

      const response = res.render('some/sub/folder/locals');

      expect(response).to.be.an('object');
      expect(response).to.have.all.keys('statusCode', 'body', 'headers', 'isBase64Encoded');
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.keys('Content-Type', 'Default-Header');
      expect(response.headers['Content-Type']).to.equal('text/html');
      expect(response.headers['Default-Header']).to.equal(config.headers['Default-Header']);
      expect(is.json(response.body)).to.be.false;
      expect(response.body).to.contain('<!DOCTYPE html>')
        .and.to.match(/.+\snonce="[A-Za-z0-9_/+=]+".+/)
        .and.to.contain('</html>');
    });
  });
});
