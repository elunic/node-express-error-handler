// tslint:disable:no-any

import * as errors from 'common-errors';
import * as Debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as httpErrors from 'http-errors';

const debug = Debug('@elunic/express-error-handler');

exports = module.exports = errorHandler;

/**
 *
 * @param {boolean} full Full output mode, outputs error stacks/messages.
 * @param {function} onError Callback that is called every time the handler is invoked. Takes the error as first parameter. Could be used to log errors.
 * @returns {function} Express Error Middleware
 */
function errorHandler({
  full,
  onError,
}: {
  full?: boolean;
  onError?: (err: any) => void;
} = {}) {
  return function ErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    debug('handling error', err);

    if (onError) {
      onError(err);
    }

    if (
      err instanceof errors.ArgumentError ||
      err.name === 'ArgumentError' ||
      err instanceof errors.ValidationError ||
      err.name === 'ValidationError'
    ) {
      err = httpErrors(400, err);
    } else if (
      err instanceof errors.AuthenticationRequiredError ||
      err.name === 'AuthenticationRequiredError'
    ) {
      err = httpErrors(401, err);
    } else if (err instanceof errors.NotPermittedError || err.name === 'NotPermittedError') {
      err = httpErrors(403, err);
    } else if (err instanceof errors.NotFoundError || err.name === 'NotFoundError') {
      err = httpErrors(404, err);
    }

    if (err instanceof httpErrors.HttpError || (err instanceof Error && 'statusCode' in err)) {
      return res.status(err.statusCode).json({
        error: {
          type: err.name,
          code: err.code,
          message: full ? err.message : undefined,
          stack: full ? err.stack : undefined,
        },
      });
    }

    if (err instanceof Error) {
      return res.status(500).json({
        error: {
          type: err.name,
          // @ts-ignore
          code: err.code,
          message: full ? err.message : undefined,
          stack: full ? err.stack : undefined,
        },
      });
    }

    if (err.statusCode) {
      return res.status(err.statusCode).json({
        error: {
          type: 'Error',
          code: err.code,
          message: full ? err.message : undefined,
          stack: full ? err.stack : undefined,
        },
      });
    }

    return res.status(500).json({
      error: {
        type: 'Error',
        message: err,
        stack: full ? new Error().stack : undefined,
      },
    });
  };
}
export default errorHandler;
export { errorHandler };
