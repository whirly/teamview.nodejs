import webpack from 'webpack';
import client from './webpack/webpack.config.client';
import server from './webpack/webpack.config.server';

const sides = { client, server };

export default function(env) {
    //=> Compile one side on-demand
    if (env && env.side) {
        return sides[env.side];
    }

    //=> Compile all sides
    return Object.values(sides);
};

function setIgnoredSide(configuration, ignoredSide) {
    const ignoreSide = new webpack.IgnorePlugin(/.*/, ignoredSide);
    const ignoreDist = new webpack.IgnorePlugin(/.*/, /dist(\\|\/)/);

    configuration.plugins.push(ignoreSide, ignoreDist);

    return configuration;
}
