# karmia-express-middleware-rpc

RPC module of Karmia JavaScript library

## Installation

```Shell
npm install karmia-express-middleware-rpc
```

## Example

### Server

```JavaScript
const karmia_express_middleware_rpc = require('karmia-express-middleware-rpc'),
    rpc = karmia_express_middleware_rpc();
rpc.methods.set('method', function () {
    return Promise.resolve({success: true});
});

const body_parser = require('body-parser'),
    express = require('express'),
    karmia_context = require('karmia-context'),
    app = express(),
    context = karmia_context();

app.use(function (req, res, next) {
    req.context = context.child();
    
    next();
});
app.use(body_parser.json());
app.post('/', rpc.middleware());
app.use(function (req, res) {
    res.status(res.code).end(JSON.stringify(res.body));
});

app.listen(3000);
```

### Client

```JavaScript
const http = require('http'),
    request = (parameters) => {
        const body = JSON.stringify(parameters),
            options = {
                hostname: 'localhost',
                port: 3000,
                method: 'POST',
                path: '/',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Content-Length': Buffer.byteLength(body)
                }
        };

        return new Promise(function (resolve) {
            const request = http.request(options, (response) => {
                response.setEncoding('UTF-8');
                response.data = '';

                response.on('data', (chunk) => {
                    response.data = response.data + chunk;
                });

                response.on('end', function () {
                    resolve(JSON.parse(response.data));
                });
            });

            request.write(body);
            request.end();
        });
    };

request({method: 'method', params: {}).then(function (result) {
    console.log(result);
});
```
