import { expect } from 'chai';
import { join } from 'path';
import faker from 'faker';

import { createViewLoader, ViewsConfig } from '../../src/views';

describe('Views', function () {
  this.timeout(30000);

  let config: ViewsConfig = null;

  before(function () {
    config = {
      basedir: join('test', 'fixtures', 'views'),
      locals: {}
    };
  });

  it('should be a function', function () {
    expect(createViewLoader).to.be.a('function');
  });

  it('should not create an instance with an empty config', function () {
    expect(() => createViewLoader(undefined)).to.throw();
    expect(() => createViewLoader(null)).to.throw();
  });

  it('should crea an instance with a valid config', function () {
    let views;

    expect(() => views = createViewLoader(config)).to.not.throw();
    expect(views).to.be.an('object');
  });

  it('should retrieve views with valid relative paths', function () {
    const views = createViewLoader(config);
    const list = [
      views.get('some/sub/folder/locals'),
      views.get('simple'),
      views.get('index')
    ];

    for (const view of list) {
      expect(view).to.be.a('function');
    }
  });

  it('should render a view', function () {
    const views = createViewLoader(config);
    const html = views.render('simple');

    expect(html).to.be.a('string').that.contains('<!DOCTYPE html>')
      .and.contains('<html lang="en">')
      .and.contains('<head>')
      .and.contains('<title>')
      .and.contains('</title>')
      .and.contains('</head>')
      .and.contains('<body>')
      .and.contains('</body>')
      .and.contains('</html>');
  });

  it('should render a view with locals', function () {
    const views = createViewLoader(config);
    const locals = {
      uuid: faker.random.uuid()
    };

    const html = views.render('some/sub/folder/locals', locals);

    expect(html).to.be.a('string').that.contains('<!DOCTYPE html>')
      .and.contains('<html lang="en">')
      .and.contains('<head>')
      .and.contains('<title>')
      .and.contains('</title>')
      .and.contains('</head>')
      .and.contains('<body>')
      .and.contains(locals.uuid)
      .and.contains('</body>')
      .and.contains('</html>');
  });
});
