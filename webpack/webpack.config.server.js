const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const webpackNodeExternals = require('webpack-node-externals');
const { mode, isProductionBuild, fromRoot } = require('./environment');
const agnosticConfig = require('./webpack.config.agnostic');

const envAgnosticConfig = {
    mode,
    target: 'node',

    devtool: 'source-map',
    performance: false,

    optimization: {
        minimize: false
    },

    externals: [webpackNodeExternals()],

    entry: {
        main: fromRoot('server/main.ts'),
        cli: fromRoot('server/cli/index.ts')
    },

    output: {
        path: fromRoot('dist/server')
    },

    plugins: [
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            raw: true,
            entryOnly: false
        }),
        new webpack.DefinePlugin({
            // The server uses the .env file or real env vars, but we'll override
            // process.env.NODE_ENV to match the mode in which the server is built.
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
    ],

    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.ts$/,
                loader: 'tslint-loader',
                options: { configFile: fromRoot('tslint.json') }
            },
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [fromRoot('node_modules')]
    },

    node: {
        global: true,
        crypto: 'empty',
        __dirname: false,  // false, to avoid the variable replacement by Webpack,
        __filename: false, // and keep the original Node __dirname/__filename globals.
        process: true,
        Buffer: true,
        clearImmediate: true,
        setImmediate: true
    }
};

const developmentConfig = {};

const productionConfig = {};

module.exports = webpackMerge(
    agnosticConfig,
    envAgnosticConfig,
    isProductionBuild ? productionConfig : developmentConfig
);
