# @fiquu/lambda-http-event-handler

Lambda event handler for API Gateway HTTP requests.

## Installation

```
npm i @fiquu/lambda-http-event-handler
```

## Usage

### HTTP Event

This will generate the necessary objects to handle an HTTP request graciously:

`/api/my-path/handler.ts`
```ts
import { noContent } from '@fiquu/lambda-http-event-handler/responses';
import { createHTTPEvent } from '@fiquu/lambda-http-event-handler';
import { createLogger } from '@fiquu/logger';

import config from '../../configs/http-event';

const log = createLogger('HTTP /api/my-path');

export default function handler(event: APIGatewayProxyEvent): APIGatewayProxyResult {
  const { req, res } = createHTTPEvent(event);

  console.log(req.headers);
  console.log(req.params);
  console.log(req.query);
  console.log(req.body);

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
