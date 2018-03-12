import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import VisualizerPlugin from 'webpack-visualizer-plugin';
import { AngularCompilerPlugin } from '@ngtools/webpack';
import { isProductionBuild, fromRoot } from './environment';
import agnosticConfig from './webpack.config.agnostic';

// Make available a defined subset of process.env variables to the client
const clientExposedEnvVars = process.env.CLIENT_EXPOSED_ENV_VARS.split(',');
const clientExposedEnv = {};
Object
    .keys(process.env)
    .filter(key => clientExposedEnvVars.includes(key))
    .forEach(key => clientExposedEnv[key] = JSON.stringify(process.env[key]));

const ENV_AGNOSTIC_CONFIG = {
    entry: {
        main: fromRoot('client/main.browser.ts'),
        polyfills: fromRoot('client/polyfills.browser.ts')
    },

    output: {
        publicPath: '',
        path: fromRoot('dist/client'),
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].bundle.map',
        chunkFilename: '[id].chunk.js'
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['main', 'polyfills'],
            minChunks: Infinity
        }),
        new webpack.DefinePlugin({
            'process.env': clientExposedEnv
        }),
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            fromRoot('client'),
            {}
        ),
        new HtmlWebpackPlugin({
            template: fromRoot('client/index.html')
        })
    ],

    module: {
        rules: [
            // Styles
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
            { test: /\.global\.scss$/, loaders: ['style-loader?sourceMap', 'css-loader?sourceMap', 'resolve-url-loader', 'sass-loader?sourceMap'] }, // global styles
            { test: /^(?!.*global).*\.scss$/, loaders: ['exports-loader?module.exports.toString()', 'css-loader?sourceMap', 'resolve-url-loader', 'sass-loader?sourceMap'] }, // scoped styles
            {
                test: /node_modules.*\.css$/,
                loaders: ['style-loader', 'css-loader', 'resolve-url-loader']
            },
            // Images
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
            // Fonts
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' }},
            { test: /\.(ttf|eot|svg|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },

        ]
    },

    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [fromRoot('node_modules')]
    },

    devServer: {
        historyApiFallback: true,
        watchOptions: { aggregateTimeout: 300, poll: 1000 }
    },

    node: {
        global: true,
        crypto: 'empty',
        __dirname: true,
        __filename: true,
        process: true,
        Buffer: false,
        clearImmediate: false,
        setImmediate: false
    }
};

const DEVELOPMENT_CONFIG = {
    devtool: 'source-map',

    module: {
        rules: [
            { test: /\.ts$/, loaders: ['awesome-typescript-loader', 'angular2-template-loader', 'angular2-router-loader'] }
        ]
    }
};

const PRODUCTION_CONFIG = {
    devtool: false,

    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: fromRoot('tsconfig.json'),
            entryModule: fromRoot('client/app/app.module#AppModule')
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            comments: false, // also strips licenses
            sourceMap: false
        }),
        new CompressionPlugin({
            test: /\.js$/
        }),
        new VisualizerPlugin()
    ],

    module: {
        rules: [
            { test: /\.ts$/, loader: '@ngtools/webpack' }
        ]
    },
};

export default webpackMerge(
    agnosticConfig,
    ENV_AGNOSTIC_CONFIG,
    isProductionBuild ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG
);

