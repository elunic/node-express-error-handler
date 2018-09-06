const errors = require('common-errors');
const httpErrors = require('http-errors');
const debug = require('debug')('@elunic/express-error-handler');

/**
 *
 * @param {boolean} full Full output mode, outputs error stacks/messages.
 * @param {function} onError Callback that is called every time the handler is invoked. Takes the error as first parameter. Could be used to log errors.
 * @returns {function} Express Error Middleware
 */
module.exports = (
    {
        full = false,
        onError = false,
    }
    = {}
) => {
    return function ErrorMiddleware(err, req, res, next) {
        debug('handling error', err);
        onError && onError(err);

        if (err instanceof errors.ArgumentError || err.name === 'ArgumentError') {
            err = httpErrors(400, err);
        }

        if (err instanceof httpErrors.HttpError || (err instanceof Error && err.statusCode)) {
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
                stack: full ? (new Error).stack : undefined,
            },
        });
    }
};
