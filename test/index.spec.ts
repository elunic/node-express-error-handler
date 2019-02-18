import * as errors from 'common-errors';
import * as express from 'express';
import { Express } from 'express';
import getPort = require('get-port');
import { Server } from 'http';
import * as httpErrors from 'http-errors';
import * as request from 'supertest';

import { errorHandler } from '../src';

describe('express-error-handler', () => {
  let app: Express;
  let server: Server;
  let errorMw;

  beforeEach(async () => {
    app = express();

    app.get('/green', (req, res) => {
      res
        .status(200)
        .type('text')
        .send('OK');
    });

    app.get('/404', (req, res) => {
      throw new httpErrors.NotFound('Not found');
    });

    app.get('/err-with-statuscode-401', (req, res) => {
      throw {
        statusCode: 401,
        message: 'Unauthorized',
      };
    });

    app.get('/generic-error', (req, res) => {
      throw new Error('Generic Error');
    });

    app.get('/argument-error', (req, res) => {
      throw new errors.ArgumentError('Invalid argument');
    });
    app.get('/custom-argument-error', (req, res) => {
      const err = new Error('Custom ArgumentError');

      err.name = 'ArgumentError';

      throw err;
    });

    app.get('/validation-error', (req, res) => {
      throw new errors.ValidationError('Invalid schema');
    });
    app.get('/custom-validation-error', (req, res) => {
      const err = new Error('Custom ValidationError');

      err.name = 'ValidationError';

      throw err;
    });

    app.get('/authentication-required-error', (req, res) => {
      throw new errors.AuthenticationRequiredError('Unauthorized');
    });
    app.get('/custom-authentication-required-error', (req, res) => {
      const err = new Error('Custom AuthenticationRequiredError');

      err.name = 'AuthenticationRequiredError';

      throw err;
    });

    app.get('/notpermitted-error', (req, res) => {
      throw new errors.NotPermittedError('Forbidden');
    });
    app.get('/custom-notpermitted-error', (req, res) => {
      const err = new Error('Custom NotPermittedError');

      err.name = 'NotPermittedError';

      throw err;
    });

    app.get('/notfound-error', (req, res) => {
      throw new errors.NotFoundError('Not found');
    });
    app.get('/custom-notfound-error', (req, res) => {
      const err = new Error('Custom NotFoundError');

      err.name = 'NotFoundError';

      throw err;
    });

    // Thrown by the `ow` package, for example [wh]
    app.get('/custom-error', (req, res) => {
      const err = new Error('Custom error');

      err.name = 'CustomError';

      throw err;
    });
  });

  describe('sparse mode, no full output', () => {
    beforeEach(async () => {
      errorMw = errorHandler({
        full: false,
      });
      app.use(errorMw);

      return new Promise(async (resolve, reject) => {
        try {
          server = app.listen(await getPort(), (err: unknown) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        } catch (ex) {
          reject(ex);
        }
      });
    });

    it('should return status 200 and content OK', done => {
      request(app)
        .get('/green')
        .expect(200, 'OK')
        .expect('Content-Type', 'text/plain; charset=utf-8', done);
    });

    it('should return status 404 and JSON with type NotFoundError', done => {
      request(app)
        .get('/404')
        .expect(404, {
          error: {
            type: 'NotFoundError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 401 and JSON with type Error', done => {
      request(app)
        .get('/err-with-statuscode-401')
        .expect(401, {
          error: {
            type: 'Error',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 500 and JSON with type Error', done => {
      request(app)
        .get('/generic-error')
        .expect(500, {
          error: {
            type: 'Error',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 400 and JSON with type ArgumentError', done => {
      request(app)
        .get('/argument-error')
        .expect(400, {
          error: {
            type: 'ArgumentError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 400 and JSON with custom type ArgumentError', done => {
      request(app)
        .get('/custom-argument-error')
        .expect(400, {
          error: {
            type: 'ArgumentError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 400 and JSON with type ValidationError', done => {
      request(app)
        .get('/validation-error')
        .expect(400, {
          error: {
            type: 'ValidationError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 400 and JSON with custom type ValidationError', done => {
      request(app)
        .get('/custom-validation-error')
        .expect(400, {
          error: {
            type: 'ValidationError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 401 and JSON with type AuthenticationRequiredError', done => {
      request(app)
        .get('/authentication-required-error')
        .expect(401, {
          error: {
            type: 'AuthenticationRequiredError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 401 and JSON with custom type AuthenticationRequiredError', done => {
      request(app)
        .get('/custom-authentication-required-error')
        .expect(401, {
          error: {
            type: 'AuthenticationRequiredError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 403 and JSON with type NotPermittedError', done => {
      request(app)
        .get('/notpermitted-error')
        .expect(403, {
          error: {
            type: 'NotPermittedError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 403 and JSON with custom type NotPermittedError', done => {
      request(app)
        .get('/custom-notpermitted-error')
        .expect(403, {
          error: {
            type: 'NotPermittedError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 400 and JSON with type CustomError', done => {
      request(app)
        .get('/custom-error')
        .expect(500, {
          error: {
            type: 'CustomError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 404 and JSON with type NotFoundError', done => {
      request(app)
        .get('/notfound-error')
        .expect(404, {
          error: {
            type: 'NotFoundError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should return status 404 and JSON with custom type NotFoundError', done => {
      request(app)
        .get('/custom-notfound-error')
        .expect(404, {
          error: {
            type: 'NotFoundError',
          },
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });
  });

  describe('full mode, stack and message', () => {
    beforeEach(async () => {
      errorMw = errorHandler({
        full: true,
      });
      app.use(errorMw);

      return new Promise(async (resolve, reject) => {
        try {
          server = app.listen(await getPort(), (err: unknown) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        } catch (ex) {
          reject(ex);
        }
      });
    });

    it('should return status 200 and content OK', done => {
      request(app)
        .get('/green')
        .expect(200, 'OK')
        .expect('Content-Type', 'text/plain; charset=utf-8', done);
    });

    it('should return status 404 and JSON with type NotFoundError, message Not Found', () => {
      return request(app)
        .get('/404')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .then(res => {
          expect(res.body).toEqual(
            jasmine.objectContaining({
              error: jasmine.objectContaining({
                type: 'NotFoundError',
                message: 'Not found',
                stack: jasmine.any(String),
              }),
            }),
          );
        });
    });
    it('should return status 404 and JSON with type NotFoundError, message Invalid Argument, stack', () => {
      return request(app)
        .get('/notfound-error')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .then(res => {
          expect(res.body).toEqual(
            jasmine.objectContaining({
              error: jasmine.objectContaining({
                type: 'NotFoundError',
                message: 'Not Found: "Not found"',
                stack: jasmine.any(String),
              }),
            }),
          );
        });
    });

    it('should return status 400 and JSON with custom type ArgumentError, message Invalid Argument, stack', () => {
      return request(app)
        .get('/custom-notfound-error')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .then(res => {
          expect(res.body).toEqual(
            jasmine.objectContaining({
              error: jasmine.objectContaining({
                type: 'NotFoundError',
                message: 'Custom NotFoundError',
                stack: jasmine.any(String),
              }),
            }),
          );
        });
    });
  });

  describe('with error callback', () => {
    it('should return status 404 and JSON with type NotFoundError, message Not Found', async () => {
      let onErrorCalled = false;
      let onErrorErr: unknown;

      errorMw = errorHandler({
        onError: (err: unknown) => {
          onErrorCalled = true;
          onErrorErr = err;
        },
      });
      app.use(errorMw);

      await new Promise(async (resolve, reject) => {
        try {
          server = app.listen(await getPort(), (err: unknown) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        } catch (ex) {
          reject(ex);
        }
      });

      return request(app)
        .get('/404')
        .then(res => {
          expect(onErrorCalled).toBeTruthy();
          expect(onErrorErr instanceof httpErrors.NotFound).toBeTruthy();
        });
    });
  });

  afterEach(async () => {
    return new Promise((resolve, reject) => {
      server.close((err: unknown) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  });
});
