/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/* eslint-env es6, mocha, node */
/* eslint-extends: eslint:recommended */
'use strict';



// Variables
const http = require('http'),
    body_parser = require('body-parser'),
    expect = require('expect.js'),
    karmia_context = require('karmia-context'),
    express = require('express'),
    karmia_express_middleware_rpc = require('../'),
    app = express(),
    rpc = karmia_express_middleware_rpc(),
    request = (parameters) => {
        const body = JSON.stringify(parameters),
            options = {
                hostname: 'localhost',
                port: 30000,
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


// RPC
rpc.methods.set('success', function () {
    return Promise.resolve({success: true});
});
rpc.methods.set('error', function () {
    const error = new Error('TEST_EXCEPTION');
    error.code = 500;

    return Promise.reject(error);
});

// Middleware
app.use(function (req, res, next) {
    req.context = karmia_context();

    next();
});
app.use(body_parser.json());
app.use(rpc.middleware());
app.use(function (req, res) {
    res.header('Content-Type', 'application/json; UTF-8');
    res.status(res.code).end(JSON.stringify({
        result: res.body
    }));
});
app.use(function (error, req, res, next) {
    res.header('Content-Type', 'application/json; UTF-8');
    res.status(res.code).end(JSON.stringify({
        error: {
            code: res.body.code,
            message: res.body.message
        }
    }));
});

// Listen
app.listen(30000);



describe('karmia-express-rpc-rpc', function () {
    describe('middleware', function () {
        it('Should get middleware function', function () {
            expect(rpc.middleware).to.be.a(Function);
        });
    });

    describe('RPC', function () {
        it('success', function (done) {
            const data = {method: 'success'};
            request(data).then(function (result) {
                expect(result).to.eql({result: {success: true}});

                done();
            });
        });

        it('fail', function (done) {
            const data = {method: 'error'};
            request(data).then(function (result) {
                expect(result).to.eql({
                    error: {
                        code: 500,
                        message: 'TEST_EXCEPTION'
                    }
                });

                done();
            });
        });
    });
});


/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
