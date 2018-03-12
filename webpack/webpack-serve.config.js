const history = require('connect-history-api-fallback');
const convert = require('koa-connect');

const clientConfig = require('./webpack.config.client');

module.exports = clientConfig;

module.exports.serve = {
    port: 3000,
    clipboard: false,

    add(app, middleware, options) {
        app.use(convert(history()));
    }
};
