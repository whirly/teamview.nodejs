import WatchIgnorePlugin from 'watch-ignore-webpack-plugin';
import { fromRoot } from './configuration/environment';

export default function(env) {
    if(!env || !env.side) {
        console.error('Please pass CLI argument --env.side=server|client');
        process.exit(1);
    }

    switch (env.side) {
        case 'server': return setIgnoredSide(require('./configuration/webpack.config.server').default, 'client');
        case 'client': return setIgnoredSide(require('./configuration/webpack.config.client').default, 'server');
    }
};

function setIgnoredSide(configuration, ignoredSide) {
    const ignorePlugin = new WatchIgnorePlugin([
        fromRoot(ignoredSide), fromRoot('dist')
    ]);

    configuration.plugins.push(ignorePlugin);

    return configuration;
}
