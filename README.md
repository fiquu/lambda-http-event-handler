# @fiquu/lambda-http-event-handler

Lambda event handler for API Gateway HTTP requests.

## Installation

```
npm i @fiquu/lambda-http-event-handler
```

## Usage

### HTTP Event

This will generate the necessary objects to handle an HTTP request graciously:

`/configs/http-event.ts`
```ts
import { conflict, badRequest } from '@fiquu/lambda-http-event-handler/lib/responses';
import { HTTPEventConfig } from '@fiquu/lambda-http-event-handler';

const handlers = new Map();

handlers.set(11000, conflict);
handlers.set('ValidationError', badRequest);

const config: HTTPEventConfig = {
  res: {
    handlers
  }
};

export default config;
```

`/service/my-function/handler.ts`
```ts
import { noContent } from '@fiquu/lambda-http-event-handler/lib/responses';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createHTTPEvent } from '@fiquu/lambda-http-event-handler';
import { createLogger } from '@fiquu/logger';

import config from '../../configs/http-event';

const log = createLogger('HTTP /api/my-path');

/**
 * Test handler function.
 */
export default function handler(event: APIGatewayProxyEvent): APIGatewayProxyResult {
  const { req, res } = createHTTPEvent(event, config);

  log.debug(req.headers);
  log.debug(req.params);
  log.debug(req.query);
  log.debug('Body:', req.body);

  try {
    return res.send(noContent());
  } catch (err) {
    log.error('It failed...', { err });
    return res.handle(err);
  }
}
```

### View Rendering

`/configs/http-event.ts`
```ts
import { StaticFileHandlerConfig } from '@fiquu/lambda-http-event-handler/statics';

const config: StaticFileHandlerConfig = {
  res: {
    nonce: true,
    views: {
      basedir: join(__dirname, '..', 'fixtures', 'views'),
      locals: {}
    }
  }
};

export default config;
```

`/api/my-path/handler.ts`
```ts
import { noContent } from '@fiquu/lambda-http-event-handler/responses';
import { createHTTPEvent } from '@fiquu/lambda-http-event-handler';
import { createLogger } from '@fiquu/logger';

import config from './configs/http-event';

const log = createLogger('HTTP /view-path');

export default function handler(event: APIGatewayProxyEvent): APIGatewayProxyResult {
  const { req, res } = createHTTPEvent(event, config);

  try {
    return res.render('the-view', {
      body: req.body
    });
  } catch (err) {
    log.error('It failed...', { err });
    return res.render(err);
  }
}
```

### Static File Serving

`/configs/statics.ts`
```ts
import { StaticFileHandlerConfig } from '@fiquu/lambda-http-event-handler/statics';

const config: StaticFileHandlerConfig = {
  basedir: join('..', 'static')
};

export default config;
```

`/statics/handler.ts`
```ts
import { createStaticFileHandler, StaticFileHandler } from '@fiquu/lambda-http-event-handler/statics';

import config from '../configs/statics';

const staticFileHandler: StaticFileHandler = createStaticFileHandler(config);

export default function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  return staticFileHandler.get(event);
}
```
