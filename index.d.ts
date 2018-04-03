import KarmiaRPC = require("karmia-rpc");

declare class KarmiaExpressMiddlewareRPC {
    methods: KarmiaRPC;

    constructor(options?: object);
    middleware(): Function;
}

export = KarmiaExpressMiddlewareRPC;
