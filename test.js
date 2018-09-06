const express = require('express');
const request = require('supertest');

const errors = require('common-errors');
const httpErrors = require('http-errors');

const port = 8088;

describe('express-error-handler', function() {
    let app;
    let server;
    let errorMw;

    beforeEach(async function() {
        app = express();

        app.get('/green', (req, res) => {
            res.status(200).type('text').send('OK');
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

        // Thrown by the `ow` package, for example [wh]
        app.get('/custom-error', (req, res) => {
            const err = new Error('Custom error');

            err.name = 'CustomError';

            throw err;
        });
    });

    describe('sparse mode, no full output', function() {
        beforeEach(async function() {
            errorMw = require('./index')({
                full: false,
            });
            app.use(errorMw);

            return new Promise((resolve, reject) => {
                try {
                    server = app.listen(port, (err) => {
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

        it('should return status 200 and content OK', function(done) {
            request(app)
                .get('/green')
                .expect(200, 'OK')
                .expect('Content-Type', 'text/plain; charset=utf-8', done)
            ;
        });

        it('should return status 404 and JSON with type NotFoundError', function(done) {
            request(app)
                .get('/404')
                .expect(404, {
                    error: {
                        type: 'NotFoundError',
                    },
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });

        it('should return status 401 and JSON with type Error', function(done) {
            request(app)
                .get('/err-with-statuscode-401')
                .expect(401, {
                    error: {
                        type: 'Error',
                    },
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });

        it('should return status 500 and JSON with type Error', function(done) {
            request(app)
                .get('/generic-error')
                .expect(500, {
                    error: {
                        type: 'Error',
                    },
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });

        it('should return status 400 and JSON with type ArgumentError', function(done) {
            request(app)
                .get('/argument-error')
                .expect(400, {
                    error: {
                        type: 'ArgumentError',
                    },
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });

        it('should return status 400 and JSON with type CustomError', function(done) {
            request(app)
                .get('/custom-error')
                .expect(500, {
                    error: {
                        type: 'CustomError',
                    },
                })
                .expect('Content-Type', 'application/json; charset=utf-8', done)
            ;
        });
    });

    describe('full mode, stack and message', function() {
        beforeEach(async function() {
            errorMw = require('./index')({
                full: true,
            });
            app.use(errorMw);

            return new Promise((resolve, reject) => {
                try {
                    server = app.listen(port, (err) => {
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

        it('should return status 200 and content OK', function(done) {
            request(app)
                .get('/green')
                .expect(200, 'OK')
                .expect('Content-Type', 'text/plain; charset=utf-8', done)
            ;
        });

        it('should return status 404 and JSON with type NotFoundError, message Not Found', function() {
            return request(app)
                .get('/404')
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((res) => {
                    expect(res.body).toEqual(jasmine.objectContaining({
                        error: jasmine.objectContaining({
                            type: 'NotFoundError',
                            message: 'Not found',
                            stack: jasmine.any(String),
                        }),
                    }));
                })
            ;
        });

        it('should return status 401 and JSON with type Error, message Unauthorized, no stack', function() {
            return request(app)
                .get('/err-with-statuscode-401')
                .expect(401)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((res) => {
                    expect(res.body).toEqual(jasmine.objectContaining({
                        error: jasmine.objectContaining({
                            type: 'Error',
                            message: 'Unauthorized',
                        }),
                    }));
                })
            ;
        });

        it('should return status 400 and JSON with type Error, message Generic Error, no stack', function() {
            return request(app)
                .get('/generic-error')
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((res) => {
                    expect(res.body).toEqual(jasmine.objectContaining({
                        error: jasmine.objectContaining({
                            type: 'Error',
                            message: 'Generic Error',
                            stack: jasmine.any(String),
                        }),
                    }));
                })
            ;
        });

        it('should return status 400 and JSON with type ArgumentError, message Invalid Argument, stack', function() {
            return request(app)
                .get('/argument-error')
                .expect(400)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((res) => {
                    expect(res.body).toEqual(jasmine.objectContaining({
                        error: jasmine.objectContaining({
                            type: 'ArgumentError',
                            message: 'Invalid or missing argument supplied: Invalid argument',
                            stack: jasmine.any(String),
                        }),
                    }));
                })
            ;
        });

        it('should return status 400 and JSON with type CustomError, message Invalid Argument, stack', function() {
            return request(app)
                .get('/custom-error')
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((res) => {
                    expect(res.body).toEqual(jasmine.objectContaining({
                        error: jasmine.objectContaining({
                            type: 'CustomError',
                            message: 'Custom error',
                            stack: jasmine.any(String),
                        }),
                    }));
                })
                ;
        });
    });

    describe('with error callback', function() {
        it('should return status 404 and JSON with type NotFoundError, message Not Found', async function() {
            let onErrorCalled = false;
            let onErrorErr = undefined;

            errorMw = require('./index')({
                onError: (err) => {
                    onErrorCalled = true;
                    onErrorErr = err;
                },
            });
            app.use(errorMw);

            await new Promise((resolve, reject) => {
                try {
                    server = app.listen(port, (err) => {
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
                .then((res) => {
                    expect(onErrorCalled).toBeTruthy();
                    expect(onErrorErr instanceof httpErrors.NotFound).toBeTruthy();
                })
                ;
        });
    });

    afterEach(async function() {
        return new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    return reject(err);
                }

                app = undefined;
                server = undefined;
                errorMw = undefined;

                resolve();
            });
        });
    });
});

