/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/* eslint-env es6, mocha, node */
/* eslint-extends: eslint:recommended */
'use strict';



// Variables
const karmia_rpc = require('karmia-rpc');


/**
 * KarmiaExpressMiddlewareRPC
 *
 * @class
 */
class KarmiaExpressMiddlewareRPC {
    /**
     * Constructor
     *
     * @constructs KarmiaExpressMiddlewareRPC
     * @returns {Object}
     */
    constructor(options) {
        const self = this;
        self.methods = karmia_rpc(options);
    }

    /**
     * Get express rpc function
     *
     * @returns {function}
     */
    middleware() {
        const self = this;

        return (req, res, next) => {
            if (res.body) {
                return next();
            }

            req.api = true;
            self.methods.emit('api.call', req.body);
            self.methods.call(req.context, req.body || {}).then((result) => {
                res.code = 200;
                res.body = result;

                next();
            }).catch((error) => {
                res.code = error.code;
                res.body = error;

                next(error);
            });
        };
    }
}


// Export modules
module.exports = function (options) {
    return new KarmiaExpressMiddlewareRPC(options);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
