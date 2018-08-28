# @elunic/express-error-handler

A simple, minimalistic error handler middleware for Express.

Support `http-errors` and has very partial support for some errors from `common-errors`.

Using this error handler will output nicely formatted JSON describing the type of
error that occured and, optionally, the stack and error message.

If the handled error is an error from the `http-errors` module, or has a `statusCode` property,
the status code (and, for `http-errors`, the correct type) will be included:

```js
const httpErrors = require('http-errors');

app.get('/errorGet', (req, res) => {
    throw new httpErrors.NotFound('File not found');
})
```

Response body:
```json
// STATUS CODE: 404
{
  error: {
    type: 'NotFoundError',
    message: 'File not found',
    stack: '<stack>'
  }
}
```


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  * [Child namespaces](#child-namespaces)
  * [Global API](#global-api)
  * [Per-logger log level](#per-logger-log-level)
  * [Environment variables](#environment-variables)
- [License](#license)


## Installation

```bash
$ npm install @elunic/express-error-handler
```


## Usage

Example:

```js
const app = require('express')();
const errorHandler = require('@elunic/express-error-handler')();

app.get('/get', (req, res) => {
    // ...
});

// ... further route handlers ...

// Use AFTER all routes/other middlewares whose errors you wish to handle.
// Routes/middlewares added after this point will not have their errors handled.
app.use(errorHandler);

app.listen(80);
```


##### Full output including stack and message

Example with full stack output (absolutely not recommended for production!):
```js
const errorHandler = require('@elunic/express-error-handler')({
    full: true,
});
```


##### Callback

Example callback:
```js
const errorHandler = require('@elunic/express-error-handler')({
    onError: (err) => {
        console.error('Express stack error', err);
    }
});
```

## License

(The MIT License)

Copyright (c) 2018 elunic &lt;wh@elunic.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.