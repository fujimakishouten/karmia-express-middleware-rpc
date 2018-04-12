/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/* eslint-env es6, mocha, node */
/* eslint-extends: eslint:recommended */
'use strict';



// Import modules
import KarmiaRPC = require("karmia-rpc");

// Declarations
declare interface Methods {
    [index: string]: Function|object;
}

declare interface Parameters {
    [index: string]: any;
}

declare class KarmiaRPCError {
    code?: number;
    data?: any;
}


/**
 * KarmiaExpressMiddlewareRPC
 *
 * @class
 */
class KarmiaExpressMiddlewareRPC {
    /**
     * Properties
     */
    public methods: KarmiaRPC;

    /**
     * Constructor
     *
     * @constructs KarmiaExpressMiddlewareRPC
     * @returns {Object}
     */
    constructor(options?: Methods) {
        const self = this;
        self.methods = new KarmiaRPC(options || {});
    }

    /**
     * Get express rpc function
     *
     * @returns {function}
     */
    middleware() {
        const self = this;

        return (req: Parameters, res: Parameters, next: Function) => {
            if (res.body) {
                return next();
            }

            req.api = true;
            self.methods.emit('api.call', req.body);
            self.methods.call(req.context, req.body || {}).then((result: Parameters) => {
                res.code = 200;
                res.body = result;

                next();
            }).catch((error: KarmiaRPCError) => {
                res.code = error.code;
                res.body = error;

                next(error);
            });
        };
    }
}


// Export modules
export = KarmiaExpressMiddlewareRPC;



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
