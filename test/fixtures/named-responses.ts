const namedResponses = new Map();

namedResponses.set('ok', 200);
namedResponses.set('created', 201);
namedResponses.set('noContent', 204);
namedResponses.set('movedPermanently', 301);
namedResponses.set('notModified', 304);
namedResponses.set('badRequest', 400);
namedResponses.set('unauthorized', 401);
namedResponses.set('forbidden', 403);
namedResponses.set('notFound', 404);
namedResponses.set('notAcceptable', 406);
namedResponses.set('conflict', 409);
namedResponses.set('preconditionFailed', 412);
namedResponses.set('internalServerError', 500);

export default namedResponses;
