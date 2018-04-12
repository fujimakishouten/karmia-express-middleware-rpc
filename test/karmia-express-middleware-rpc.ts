/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/* eslint-env es6, mocha, node */
/* eslint-extends: eslint:recommended */
'use strict';



// Import modules
import http = require("http");
import BodyParser = require("body-parser");
import Express = require("express");
import KarmiaContext = require("karmia-context");
import KarmiaExpressMiddlewareRPC = require("../");


// Declarations
declare interface Parameters {
    [index: string]: any;
}

declare class HTTPResponse extends http.IncomingMessage {
    data?: string;
}

declare class KarmiaRPCError extends Error {
    code?: number;
    data?: any;
}


// Variables
const expect = require("expect.js");
const app = Express();
const rpc = new KarmiaExpressMiddlewareRPC();
const request = (parameters: {[index: string]: any}): Promise<any> => {
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
        const request = http.request(options, (response: HTTPResponse) => {
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
    const error = new Error('TEST_EXCEPTION') as KarmiaRPCError;
    error.code = 500;

    return Promise.reject(error);
});

// Middleware
app.use(function (req?: Parameters, res?: Parameters, next?: Function) {
    req.context = new KarmiaContext();

    next();
});
app.use(BodyParser.json());
app.use(rpc.middleware());
app.use(function (req: Parameters, res: Parameters) {
    res.header('Content-Type', 'application/json; UTF-8');
    res.status(res.code).end(JSON.stringify({
        result: res.body
    }));
});
app.use(function (error: KarmiaRPCError, req: Parameters, res: Parameters, next: Function) {
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
