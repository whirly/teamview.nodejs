const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { AngularCompilerPlugin } = require('@ngtools/webpack');
const { mode, isProductionBuild, fromRoot } = require('./environment');
const agnosticConfig = require('./webpack.config.agnostic');


// Make available a defined subset of process.env variables to the client
const clientExposedEnvVars = process.env.CLIENT_EXPOSED_ENV_VARS.split(',');
const clientExposedEnv = {};
Object
    .keys(process.env)
    .filter(key => clientExposedEnvVars.includes(key))
    .forEach(key => clientExposedEnv[key] = JSON.stringify(process.env[key]));

const envAgnosticConfig = {
    mode,

    entry: {
        polyfills: fromRoot('client/polyfills.ts'),
        main: fromRoot('client/main.ts')
    },

    output: {
        publicPath: '',
        path: fromRoot('dist/client')
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': clientExposedEnv
        }),
        new HtmlWebpackPlugin({
            template: fromRoot('client/index.html'),
            chunksSortMode: 'auto'
        }),
        new AngularCompilerPlugin({
            tsConfigPath: fromRoot('tsconfig.json'),
            entryModule: fromRoot('client/app/app.module#AppModule'),
            sourceMap: true
        })
    ],

    module: {
        rules: [
            //=> Disable any linking with server code!
            {
                test: /(\\|\/)server(\\|\/)/,
                loader: function(context) {
                    const msg =
                        `Attempted to link server code from client code!\n` +
                        `File ${context.issuer} requires ${context.resource}.\n` +
                        `We can't permit that!\n`;

                    console.error(`\n\n${msg}`);
                    process.exit(1);
                }
            },
            //=> Preloaders
            {
                enforce: 'pre',
                test: /\.ts$/,
                loader: 'tslint-loader',
                options: { configFile: fromRoot('client/tslint.json') }
            },
            //=> Loaders
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: { minimize: false },
                exclude: [fromRoot('client/index.html')]
            },
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.global\.scss$/,
                loaders: ['style-loader?sourceMap', 'css-loader?sourceMap', 'resolve-url-loader', 'sass-loader?sourceMap']
            },
            {
                test: /^(?!.*global).*\.scss$/,
                loaders: ['exports-loader?module.exports.toString()', 'css-loader?sourceMap', 'resolve-url-loader', 'sass-loader?sourceMap']
            },
            {
                test: /node_modules.*\.css$/,
                loaders: ['style-loader', 'css-loader', 'resolve-url-loader']
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: { hash: 'sha512', digest: 'hex', name: '[hash].[ext]' }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: { bypassOnDebug: true, optipng: { optimizationLevel: 7 }, gifsicle: { interlaced: false } }
                    }
                ]
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader',
                options: { limit: 10000, mimetype: 'application/font-woff' }
            },
            {
                test: /\.(ttf|eot|svg|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader'
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [fromRoot('node_modules')]
    }
};

const developmentConfig = {};

const productionConfig = {
    plugins: [
        new CompressionPlugin({
            test: /\.js$/
        })
    ]
};

module.exports = webpackMerge(
    agnosticConfig,
    envAgnosticConfig,
    isProductionBuild ? productionConfig : developmentConfig
);
